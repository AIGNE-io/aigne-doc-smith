import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkLint from "remark-lint";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
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
  const content =
    trimmed.startsWith("|") && trimmed.endsWith("|")
      ? trimmed.slice(1, -1)
      : trimmed;

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
  const linkRegex = /(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const link = match[2];
    const trimLink = link.trim();

    // Only check links that processContent would process
    // Exclude external links and mailto
    if (/^(https?:\/\/|mailto:)/.test(trimLink)) continue;

    // Preserve anchors
    const [path, hash] = trimLink.split("#");

    // Only process relative paths or paths starting with /
    if (!path) continue;

    // Check if this link is in the allowed links set
    if (!allowedLinks.has(trimLink)) {
      errorMessages.push(
        `Found a dead link in ${source}: [${match[1]}](${trimLink}), ensure the link exists in the structure plan path`
      );
    }
  }
}

/**
 * Check code block content for indentation consistency issues
 * @param {Array} codeBlockContent - Array of {line, lineNumber} objects from the code block
 * @param {string} source - Source description for error reporting
 * @param {Array} errorMessages - Array to push error messages to
 */
function checkCodeBlockIndentation(codeBlockContent, source, errorMessages) {
  if (codeBlockContent.length === 0) return;

  // Filter out empty lines for base indentation calculation
  const nonEmptyLines = codeBlockContent.filter(
    (item) => item.line.trim().length > 0
  );
  if (nonEmptyLines.length === 0) return;

  // Find the base indentation from the first meaningful line
  let baseCodeIndent = null;
  const problematicLines = [];

  for (const item of nonEmptyLines) {
    const { line, lineNumber } = item;
    const match = line.match(/^(\s*)/);
    const currentIndent = match ? match[1].length : 0;
    const trimmedLine = line.trim();

    // Skip lines that are clearly comments (common pattern: # comment)
    if (
      trimmedLine.startsWith("#") &&
      !trimmedLine.includes("=") &&
      !trimmedLine.includes("{")
    ) {
      continue;
    }

    // Establish base indentation from the first meaningful line
    if (baseCodeIndent === null) {
      baseCodeIndent = currentIndent;
      continue;
    }

    // Check if current line has less indentation than the base
    // This indicates inconsistent indentation that may cause rendering issues
    if (currentIndent < baseCodeIndent && baseCodeIndent > 0) {
      problematicLines.push({
        lineNumber,
        line: line.trimEnd(),
        currentIndent,
        baseIndent: baseCodeIndent,
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

      const issue = `inconsistent indentation: ${firstIssue.currentIndent} spaces (base: ${firstIssue.baseIndent} spaces)`;
      errorMessages.push(
        `Found code block with inconsistent indentation in ${source} at ${lineNumbers}: ${issue}. This may cause rendering issues`
      );
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
      } else {
        // Ending the code block
        inAnyCodeBlock = false;

        if (inCodeBlock) {
          // Check code block content for indentation issues
          checkCodeBlockIndentation(codeBlockContent, source, errorMessages);
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
      `Found incomplete code block in ${source} starting at line ${anyCodeBlockStartLine}: code block opened with \`\`\` but never closed. Please return the complete content`
    );
  }

  // Check single line content (this needs to be done after the loop)
  const newlineCount = (markdown.match(/\n/g) || []).length;
  if (newlineCount === 0 && markdown.trim().length > 0) {
    errorMessages.push(
      `Found single line content in ${source}: content appears to be on only one line, check for missing line breaks`
    );
  }

  // Check if content ends with proper punctuation (indicating completeness)
  const trimmedText = markdown.trim();
  if (
    trimmedText.length > 0 &&
    !trimmedText.endsWith(".") &&
    !trimmedText.endsWith("。")
  ) {
    errorMessages.push(
      `Found incomplete content in ${source}: content does not end with proper punctuation (. or 。). Please return the complete content`
    );
  }
}

/**
 * Check markdown content for formatting issues and mermaid syntax errors
 * @param {string} markdown - The markdown content to check
 * @param {string} [source] - Source description for error reporting (e.g., "result")
 * @param {Object} [options] - Additional options for validation
 * @param {Array} [options.allowedLinks] - Set of allowed links for link validation
 * @returns {Promise<Array<string>>} - Array of error messages in check-detail-result format
 */
export async function checkMarkdown(
  markdown,
  source = "content",
  options = {}
) {
  const file = new VFile({ value: markdown, path: source });
  const errorMessages = [];

  try {
    // Extract allowed links from options
    const { allowedLinks } = options;

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

    // 2. Check content structure and formatting issues
    checkContentStructure(markdown, source, errorMessages);

    // Check mermaid code blocks and other custom validations
    const mermaidChecks = [];
    visit(ast, "code", (node) => {
      if (node.lang && node.lang.toLowerCase() === "mermaid") {
        // Check for mermaid syntax errors
        mermaidChecks.push(
          validateMermaidSyntax(node.value).catch((error) => {
            const errorMessage =
              error?.message || String(error) || "Unknown mermaid syntax error";

            // Format mermaid error in check-detail-result style
            const line = node.position?.start?.line || "unknown";
            errorMessages.push(
              `Found Mermaid syntax error in ${source} at line ${line}: ${errorMessage}`
            );
          })
        );

        // Check for specific mermaid rendering issues
        const mermaidContent = node.value;
        const line = node.position?.start?.line || "unknown";

        // Check for backticks in node labels
        const nodeLabelRegex =
          /[A-Za-z0-9_]+\["([^"]*`[^"]*)"\]|[A-Za-z0-9_]+{"([^}]*`[^}]*)"}/g;
        let match;
        while ((match = nodeLabelRegex.exec(mermaidContent)) !== null) {
          const label = match[1] || match[2];
          errorMessages.push(
            `Found backticks in Mermaid node label in ${source} at line ${line}: "${label}" - backticks in node labels cause rendering issues in Mermaid diagrams`
          );
        }

        // Check for numbered list format in edge descriptions
        const edgeDescriptionRegex = /--\s*"([^"]*)"\s*-->/g;
        let edgeMatch;
        while (
          (edgeMatch = edgeDescriptionRegex.exec(mermaidContent)) !== null
        ) {
          const description = edgeMatch[1];
          if (/^\d+\.\s/.test(description)) {
            errorMessages.push(
              `Unsupported markdown: list - Found numbered list format in Mermaid edge description in ${source} at line ${line}: "${description}" - numbered lists in edge descriptions are not supported`
            );
          }
        }

        // Check for special characters in node labels that should be quoted
        const nodeWithSpecialCharsRegex =
          /([A-Za-z0-9_]+)\[([^\]]*[(){}:;,\-\s\.][^\]]*)\]/g;
        let specialCharMatch;
        while (
          (specialCharMatch =
            nodeWithSpecialCharsRegex.exec(mermaidContent)) !== null
        ) {
          const nodeId = specialCharMatch[1];
          const label = specialCharMatch[2];

          // Check if label contains special characters but is not quoted
          if (!/^".*"$/.test(label)) {
            // List of characters that typically need quoting
            const specialChars = ["(", ")", "{", "}", ":", ";", ",", "-", "."];
            const foundSpecialChars = specialChars.filter((char) =>
              label.includes(char)
            );

            if (foundSpecialChars.length > 0) {
              errorMessages.push(
                `Found unquoted special characters in Mermaid node label in ${source} at line ${line}: "${label}" contains ${foundSpecialChars.join(
                  ", "
                )} - node labels with special characters should be quoted like ${nodeId}["${label}"]`
              );
            }
          }
        }
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
                }: separator has ${separatorColumns} columns but header has ${headerColumns} columns - this causes table rendering issues`
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
                    }: data row has ${dataColumns} columns but separator defines ${separatorColumns} columns - this causes table rendering issues`
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

    // Run markdown linting rules
    await processor.run(ast, file);

    // Format messages in check-detail-result style
    file.messages.forEach((message) => {
      const line = message.line || "unknown";
      const column = message.column || "unknown";
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
          `Found ${errorType} issue in ${source} at line ${line}: ${reason} (${ruleId})`
        );
      } else {
        errorMessages.push(
          `Found ${errorType} issue in ${source}: ${reason} (${ruleId})`
        );
      }
    });

    return errorMessages;
  } catch (error) {
    // Handle any unexpected errors during processing
    errorMessages.push(
      `Found markdown processing error in ${source}: ${error.message}`
    );
    return errorMessages;
  }
}
