import fs from "node:fs";
import path from "node:path";
import pMap from "p-map";
import remarkGfm from "remark-gfm";
import remarkLint from "remark-lint";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { KROKI_CONCURRENCY } from "./constants.mjs";
import { checkD2Content } from "./kroki-utils.mjs";
import { validateMermaidSyntax } from "./mermaid-validator.mjs";

/**
 * Parse table row and count actual columns
 * Properly handles content within cells, including pipes that are part of content
 * @param {string} line - The table row line to analyze
 * @returns {number} - Number of actual table columns
 */
function countTableColumns(line) {
  const trimmed = line.trim();

  // Remove leading and trailing pipes if present
  const content = trimmed.startsWith("|") && trimmed.endsWith("|") ? trimmed.slice(1, -1) : trimmed;

  if (!content.trim()) {
    return 0;
  }

  const columns = [];
  let currentColumn = "";
  let i = 0;
  let inCode = false;

  while (i < content.length) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : "";

    if (char === "`") {
      // Toggle code span state
      inCode = !inCode;
      currentColumn += char;
    } else if (char === "|" && !inCode && prevChar !== "\\") {
      // This is a column separator (not escaped and not in code)
      columns.push(currentColumn.trim());
      currentColumn = "";
    } else {
      currentColumn += char;
    }

    i++;
  }

  // Add the last column
  if (currentColumn.length > 0 || content.endsWith("|")) {
    columns.push(currentColumn.trim());
  }

  return columns.length;
}

/**
 * Check for dead links in markdown content
 * @param {string} markdown - The markdown content
 * @param {string} source - Source description for error reporting
 * @param {Set} allowedLinks - Set of allowed links
 * @param {Array} errorMessages - Array to push error messages to
 */
function checkDeadLinks(markdown, source, allowedLinks, errorMessages) {
  const linkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while (true) {
    match = linkRegex.exec(markdown);
    if (match === null) break;

    const link = match[2];
    const trimLink = link.trim();

    // Only check links that processContent would process
    // Exclude external links and mailto
    if (/^(https?:\/\/|mailto:)/.test(trimLink)) continue;

    // Preserve anchors
    const [path, _hash] = trimLink.split("#");

    // Only process relative paths or paths starting with /
    if (!path) continue;

    // Check if this link is in the allowed links set
    if (!allowedLinks.has(trimLink)) {
      errorMessages.push(
        `Found a dead link in ${source}: [${match[1]}](${trimLink}), ensure the link exists in the structure plan path`,
      );
    }
  }
}

/**
 * Check code block content for indentation consistency issues
 * @param {Array} codeBlockContent - Array of {line, lineNumber} objects from the code block
 * @param {number} codeBlockIndent - The indentation of the code block start marker (```)
 * @param {string} source - Source description for error reporting
 * @param {Array} errorMessages - Array to push error messages to
 */
function checkCodeBlockIndentation(codeBlockContent, codeBlockIndent, source, errorMessages) {
  if (codeBlockContent.length === 0) return;

  // Filter out empty lines for analysis
  const nonEmptyLines = codeBlockContent.filter((item) => item.line.trim().length > 0);
  if (nonEmptyLines.length === 0) return;

  // The expected base indentation for code block content should match the code block marker
  const expectedBaseIndent = codeBlockIndent;
  const problematicLines = [];

  for (const item of nonEmptyLines) {
    const { line, lineNumber } = item;
    const match = line.match(/^(\s*)/);
    const currentIndent = match ? match[1].length : 0;

    // Check if current line has less indentation than expected
    // This indicates inconsistent indentation that may cause rendering issues
    if (currentIndent < expectedBaseIndent && expectedBaseIndent > 0) {
      problematicLines.push({
        lineNumber,
        line: line.trimEnd(),
        currentIndent,
        expectedIndent: expectedBaseIndent,
      });
    }
  }

  // Report indentation issues if found
  if (problematicLines.length > 0) {
    // Group consecutive issues to avoid spam
    const groupedIssues = [];
    let currentGroup = [problematicLines[0]];

    for (let i = 1; i < problematicLines.length; i++) {
      const current = problematicLines[i];
      const previous = problematicLines[i - 1];

      if (current.lineNumber - previous.lineNumber <= 2) {
        currentGroup.push(current);
      } else {
        groupedIssues.push(currentGroup);
        currentGroup = [current];
      }
    }
    groupedIssues.push(currentGroup);

    // Report the most significant groups
    for (const group of groupedIssues.slice(0, 2)) {
      // Limit to avoid spam
      const firstIssue = group[0];
      const lineNumbers =
        group.length > 1
          ? `lines ${group[0].lineNumber}-${group[group.length - 1].lineNumber}`
          : `line ${firstIssue.lineNumber}`;

      const issue = `insufficient indentation: ${firstIssue.currentIndent} spaces (expected: ${firstIssue.expectedIndent} spaces)`;
      errorMessages.push(
        `Found code block with inconsistent indentation in ${source} at ${lineNumbers}: ${issue}. This may cause rendering issues`,
      );
    }
  }
}

/**
 * Check for local images and verify their existence
 * @param {string} markdown - The markdown content
 * @param {string} source - Source description for error reporting
 * @param {Array} errorMessages - Array to push error messages to
 * @param {string} [markdownFilePath] - Path to the markdown file for resolving relative paths
 * @param {string} [baseDir] - Base directory for resolving relative paths (alternative to markdownFilePath)
 */
function checkLocalImages(markdown, source, errorMessages, markdownFilePath, baseDir) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while (true) {
    match = imageRegex.exec(markdown);
    if (match === null) break;
    const imagePath = match[2].trim();
    const altText = match[1];

    // Skip external URLs (http/https)
    if (/^https?:\/\//.test(imagePath)) continue;

    // Skip data URLs
    if (/^data:/.test(imagePath)) continue;

    // Check if it's a local path
    if (!imagePath.startsWith("/") && !imagePath.includes("://")) {
      // It's a relative local path, check if file exists
      try {
        let resolvedPath;
        if (markdownFilePath) {
          // Resolve relative to the markdown file's directory
          const markdownDir = path.dirname(markdownFilePath);
          resolvedPath = path.resolve(markdownDir, imagePath);
        } else if (baseDir) {
          // Resolve relative to the provided base directory
          resolvedPath = path.resolve(baseDir, imagePath);
        } else {
          // Fallback to current working directory
          resolvedPath = path.resolve(imagePath);
        }

        if (!fs.existsSync(resolvedPath)) {
          errorMessages.push(
            `Found invalid local image in ${source}: ![${altText}](${imagePath}) - only valid media resources can be used`,
          );
        }
      } catch {
        errorMessages.push(
          `Found invalid local image in ${source}: ![${altText}](${imagePath}) - only valid media resources can be used`,
        );
      }
    } else if (imagePath.startsWith("/")) {
      // Absolute local path
      try {
        if (!fs.existsSync(imagePath)) {
          errorMessages.push(
            `Found invalid local image in ${source}: ![${altText}](${imagePath}) - only valid media resources can be used`,
          );
        }
      } catch {
        errorMessages.push(
          `Found invalid local image in ${source}: ![${altText}](${imagePath}) - only valid media resources can be used`,
        );
      }
    }
  }
}

/**
 * Check content structure and formatting issues
 * @param {string} markdown - The markdown content
 * @param {string} source - Source description for error reporting
 * @param {Array} errorMessages - Array to push error messages to
 */
function checkContentStructure(markdown, source, errorMessages) {
  const lines = markdown.split("\n");
  const allCodeBlockRegex = /^\s*```(?:\w+)?$/;

  // State variables for different checks
  let inCodeBlock = false;
  let inAnyCodeBlock = false;
  let anyCodeBlockStartLine = 0;
  let codeBlockContent = [];
  let codeBlockIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for any code block markers (for incomplete code block detection)
    if (allCodeBlockRegex.test(line)) {
      if (!inAnyCodeBlock) {
        // Starting a new code block
        inAnyCodeBlock = true;
        anyCodeBlockStartLine = lineNumber;
        inCodeBlock = true;
        codeBlockContent = [];

        // Capture the indentation of the code block start marker
        const match = line.match(/^(\s*)/);
        codeBlockIndent = match ? match[1].length : 0;
      } else {
        // Ending the code block
        inAnyCodeBlock = false;

        if (inCodeBlock) {
          // Check code block content for indentation issues
          checkCodeBlockIndentation(codeBlockContent, codeBlockIndent, source, errorMessages);
          inCodeBlock = false;
        }
      }
    } else if (inCodeBlock) {
      // Collect code block content for indentation analysis
      codeBlockContent.push({ line, lineNumber });
    }
  }

  // Check for incomplete code blocks (started but not closed)
  if (inAnyCodeBlock) {
    errorMessages.push(
      `Found incomplete code block in ${source} starting at line ${anyCodeBlockStartLine}: code block opened with \`\`\` but never closed. Please return the complete content`,
    );
  }

  // Check single line content (this needs to be done after the loop)
  const newlineCount = (markdown.match(/\n/g) || []).length;
  if (newlineCount === 0 && markdown.trim().length > 0) {
    errorMessages.push(
      `Found single line content in ${source}: content appears to be on only one line, check for missing line breaks`,
    );
  }

  // Check if content ends with proper punctuation (indicating completeness)
  const validEndingPunctuation = [".", "。", ")", "|", "*"];
  const trimmedText = markdown.trim();
  const hasValidEnding = validEndingPunctuation.some((punct) => trimmedText.endsWith(punct));

  if (trimmedText.length > 0 && !hasValidEnding) {
    errorMessages.push(
      `Found incomplete content in ${source}: content does not end with proper punctuation (${validEndingPunctuation.join(", ")}). Please return the complete content`,
    );
  }
}

/**
 * Check markdown content for formatting issues and mermaid syntax errors
 * @param {string} markdown - The markdown content to check
 * @param {string} [source] - Source description for error reporting (e.g., "result")
 * @param {Object} [options] - Additional options for validation
 * @param {Array} [options.allowedLinks] - Set of allowed links for link validation
 * @param {string} [options.filePath] - Path to the markdown file for resolving relative image paths
 * @param {string} [options.baseDir] - Base directory for resolving relative image paths (alternative to filePath)
 * @returns {Promise<Array<string>>} - Array of error messages in check-detail-result format
 */
export async function checkMarkdown(markdown, source = "content", options = {}) {
  const file = new VFile({ value: markdown, path: source });
  const errorMessages = [];

  try {
    // Extract allowed links, file path, and base directory from options
    const { allowedLinks, filePath, baseDir } = options;

    // Create unified processor with markdown parsing and linting
    // Use individual rules instead of presets to have better control
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkLint)
      // Add specific useful rules, avoiding overly strict formatting ones
      .use(remarkLint, [
        // Content quality rules (keep these)
        "no-duplicate-headings",
        "no-duplicate-definitions",
        "no-unused-definitions",
        "no-undefined-references",

        // Structural rules (keep these)
        "no-heading-content-indent",
        "no-heading-indent",
        "no-multiple-toplevel-headings",

        // Link rules (keep these)
        "no-reference-like-url",
        "no-unneeded-full-reference-image",
        "no-unneeded-full-reference-link",
        "code-block-style",

        // Skip overly strict formatting rules that don't affect rendering:
        // - final-newline (missing newline at end)
        // - list-item-indent (flexible list spacing)
        // - table-cell-padding (flexible table spacing)
        // - emphasis-marker (allow both * and _)
        // - strong-marker (allow both ** and __)
      ]);

    // Parse markdown content to AST
    const ast = processor.parse(file);

    // 1. Check dead links if allowedLinks is provided
    if (allowedLinks) {
      checkDeadLinks(markdown, source, allowedLinks, errorMessages);
    }

    // 2. Check local images existence
    checkLocalImages(markdown, source, errorMessages, filePath, baseDir);

    // 3. Check content structure and formatting issues
    checkContentStructure(markdown, source, errorMessages);

    // Check mermaid code blocks and other custom validations
    const mermaidChecks = [];
    const d2ChecksList = [];
    visit(ast, "code", (node) => {
      if (node.lang) {
        const line = node.position?.start?.line || "unknown";

        if (node.lang.toLowerCase() === "mermaid") {
          // Check for mermaid syntax errors
          mermaidChecks.push(
            validateMermaidSyntax(node.value).catch((error) => {
              const errorMessage =
                error?.message || String(error) || "Unknown mermaid syntax error";

              // Format mermaid error in check-detail-result style
              errorMessages.push(
                `Found Mermaid syntax error in ${source} at line ${line}: ${errorMessage}`,
              );
            }),
          );

          // Check for specific mermaid rendering issues
          const mermaidContent = node.value;

          // Check for backticks in node labels
          const nodeLabelRegex = /[A-Za-z0-9_]+\["([^"]*`[^"]*)"\]|[A-Za-z0-9_]+{"([^}]*`[^}]*)"}/g;
          let match;
          match = nodeLabelRegex.exec(mermaidContent);
          while (match !== null) {
            const label = match[1] || match[2];
            errorMessages.push(
              `Found backticks in Mermaid node label in ${source} at line ${line}: "${label}" - backticks in node labels cause rendering issues in Mermaid diagrams`,
            );
            match = nodeLabelRegex.exec(mermaidContent);
          }

          // Check for numbered list format in edge descriptions
          const edgeDescriptionRegex = /--\s*"([^"]*)"\s*-->/g;
          let edgeMatch;
          edgeMatch = edgeDescriptionRegex.exec(mermaidContent);
          while (edgeMatch !== null) {
            const description = edgeMatch[1];
            if (/^\d+\.\s/.test(description)) {
              errorMessages.push(
                `Unsupported markdown: list - Found numbered list format in Mermaid edge description in ${source} at line ${line}: "${description}" - numbered lists in edge descriptions are not supported`,
              );
            }
            edgeMatch = edgeDescriptionRegex.exec(mermaidContent);
          }

          // Check for numbered list format in node labels (for both [] and {} syntax)
          const nodeLabelWithNumberRegex =
            /[A-Za-z0-9_]+\["([^"]*\d+\.\s[^"]*)"\]|[A-Za-z0-9_]+{"([^}]*\d+\.\s[^}]*)"}/g;
          let numberMatch;
          numberMatch = nodeLabelWithNumberRegex.exec(mermaidContent);
          while (numberMatch !== null) {
            const label = numberMatch[1] || numberMatch[2];
            // Check if the label contains numbered list format
            if (/\d+\.\s/.test(label)) {
              errorMessages.push(
                `Unsupported markdown: list - Found numbered list format in Mermaid node label in ${source} at line ${line}: "${label}" - numbered lists in node labels cause rendering issues`,
              );
            }
            numberMatch = nodeLabelWithNumberRegex.exec(mermaidContent);
          }

          // Check for special characters in node labels that should be quoted
          const nodeWithSpecialCharsRegex = /([A-Za-z0-9_]+)\[([^\]]*[(){}:;,\-\s.][^\]]*)\]/g;
          let specialCharMatch;
          specialCharMatch = nodeWithSpecialCharsRegex.exec(mermaidContent);
          while (specialCharMatch !== null) {
            const nodeId = specialCharMatch[1];
            const label = specialCharMatch[2];

            // Check if label contains special characters but is not quoted
            if (!/^".*"$/.test(label)) {
              // List of characters that typically need quoting
              const specialChars = ["(", ")", "{", "}", ":", ";", ",", "-", "."];
              const foundSpecialChars = specialChars.filter((char) => label.includes(char));

              if (foundSpecialChars.length > 0) {
                errorMessages.push(
                  `Found unquoted special characters in Mermaid node label in ${source} at line ${line}: "${label}" contains ${foundSpecialChars.join(
                    ", ",
                  )} - node labels with special characters should be quoted like ${nodeId}["${label}"]`,
                );
              }
            }
            specialCharMatch = nodeWithSpecialCharsRegex.exec(mermaidContent);
          }
        }
        if (node.lang.toLowerCase() === "d2") {
          d2ChecksList.push({
            content: node.value,
            line,
          });
        }
        // TODO: @zhanghan need to check correctness of every code language
      }
    });

    // Check table separators in original text (since AST normalizes them)
    const lines = markdown.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for table separator lines (lines with | and -)
      if (/^\s*\|.*-.*\|\s*$/.test(line)) {
        // Count separator columns
        const separatorColumns = countTableColumns(line);

        // Check if previous line looks like a table header
        if (i > 0) {
          const prevLine = lines[i - 1];
          if (/^\s*\|.*\|\s*$/.test(prevLine)) {
            // Count header columns
            const headerColumns = countTableColumns(prevLine);

            // Check for column count mismatch
            if (separatorColumns !== headerColumns) {
              errorMessages.push(
                `Found table separator with mismatched column count in ${source} at line ${
                  i + 1
                }: separator has ${separatorColumns} columns but header has ${headerColumns} columns - this causes table rendering issues`,
              );
            }

            // Also check if next line exists and has different column count
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1];
              if (/^\s*\|.*\|\s*$/.test(nextLine)) {
                const dataColumns = countTableColumns(nextLine);
                if (separatorColumns !== dataColumns) {
                  errorMessages.push(
                    `Found table data row with mismatched column count in ${source} at line ${
                      i + 2
                    }: data row has ${dataColumns} columns but separator defines ${separatorColumns} columns - this causes table rendering issues`,
                  );
                }
              }
            }
          }
        }
      }
    }

    // Wait for all mermaid checks to complete
    await Promise.all(mermaidChecks);
    await pMap(
      d2ChecksList,
      async ({ content, line }) =>
        checkD2Content({ content }).catch((err) => {
          const errorMessage = err?.message || String(err) || "Unknown d2 syntax error";
          errorMessages.push(`Found D2 syntax error in ${source} at line ${line}: ${errorMessage}`);
        }),
      { concurrency: KROKI_CONCURRENCY },
    );

    // Run markdown linting rules
    await processor.run(ast, file);

    // Format messages in check-detail-result style
    file.messages.forEach((message) => {
      const line = message.line || "unknown";
      const reason = message.reason || "Unknown markdown issue";
      const ruleId = message.ruleId || message.source || "markdown";

      // Categorize different types of issues
      let errorType = "markdown formatting";
      if (ruleId.includes("table")) {
        errorType = "table";
      } else if (ruleId.includes("code")) {
        errorType = "code block";
      } else if (ruleId.includes("link")) {
        errorType = "link";
      }

      // Format error message similar to check-detail-result style
      if (line !== "unknown") {
        errorMessages.push(
          `Found ${errorType} issue in ${source} at line ${line}: ${reason} (${ruleId})`,
        );
      } else {
        errorMessages.push(`Found ${errorType} issue in ${source}: ${reason} (${ruleId})`);
      }
    });

    return errorMessages;
  } catch (error) {
    // Handle any unexpected errors during processing
    errorMessages.push(`Found markdown processing error in ${source}: ${error.message}`);
    return errorMessages;
  }
}
