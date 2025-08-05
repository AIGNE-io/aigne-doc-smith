export default async function checkDetailResult({
  structurePlan,
  reviewContent,
}) {
  const linkRegex = /(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g;
  const tableSeparatorRegex = /^\s*\|\s*-+\s*\|\s*$/;
  const codeBlockRegex = /^\s+```(?:\w+)?$/;

  let isApproved = true;
  const detailFeedback = [];

  // Create a set of allowed links, including both original paths and processed .md paths
  const allowedLinks = new Set();
  structurePlan.forEach((item) => {
    // Add original path
    allowedLinks.add(item.path);

    // Add processed .md path (same logic as processContent in utils.mjs)
    let processedPath = item.path;
    if (processedPath.startsWith(".")) {
      processedPath = processedPath.replace(/^\./, "");
    }
    let flatPath = processedPath.replace(/^\//, "").replace(/\//g, "-");
    flatPath = `./${flatPath}.md`;
    allowedLinks.add(flatPath);
  });

  const checkLinks = (text, source) => {
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
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
        isApproved = false;
        detailFeedback.push(
          `Found a dead link in ${source}: [${match[1]}](${trimLink}), ensure the link exists in the structure plan path`
        );
      }
    }
  };

  const performAllChecks = (text, source) => {
    // Split text into lines once and perform all checks in a single pass
    const lines = text.split("\n");

    // State variables for different checks
    let inCodeBlock = false;
    let codeBlockIndentLevel = 0;
    let codeBlockStartLine = 0;
    let inMermaidBlock = false;
    let mermaidStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check table separators
      if (tableSeparatorRegex.test(line)) {
        isApproved = false;
        detailFeedback.push(
          `Found an incorrect table separator in ${source} at line ${lineNumber}: ${line.trim()}`
        );
      }

      // Check code block markers and indentation
      if (codeBlockRegex.test(line)) {
        if (!inCodeBlock) {
          // Starting a new code block
          inCodeBlock = true;
          codeBlockStartLine = lineNumber;
          // Calculate indentation level of the code block marker
          const match = line.match(/^(\s*)(```)/);
          codeBlockIndentLevel = match ? match[1].length : 0;
        } else {
          // Ending the code block
          inCodeBlock = false;
          codeBlockIndentLevel = 0;
        }
      } else if (inCodeBlock) {
        // If we're inside a code block, check if content has proper indentation
        const contentIndentLevel = line.match(/^(\s*)/)[1].length;

        // If code block marker has indentation, content should have at least the same indentation
        if (
          codeBlockIndentLevel > 0 &&
          contentIndentLevel < codeBlockIndentLevel
        ) {
          isApproved = false;
          detailFeedback.push(
            `Found code block with inconsistent indentation in ${source} at line ${codeBlockStartLine}: code block marker has ${codeBlockIndentLevel} spaces indentation but content at line ${lineNumber} has only ${contentIndentLevel} spaces indentation`
          );
          // Reset to avoid multiple errors for the same code block
          inCodeBlock = false;
          codeBlockIndentLevel = 0;
        }
      }

      // Check mermaid block markers
      if (/^\s*```mermaid\s*$/.test(line)) {
        inMermaidBlock = true;
        mermaidStartLine = lineNumber;
      } else if (inMermaidBlock && /^\s*```\s*$/.test(line)) {
        inMermaidBlock = false;
      } else if (inMermaidBlock) {
        // If we're inside a mermaid block, check for backticks in node labels
        // Check for node definitions with backticks in labels
        // Pattern: A["label with backticks"] or A{"label with backticks"}
        const nodeLabelRegex =
          /[A-Za-z0-9_]+\["([^"]*`[^"]*)"\]|[A-Za-z0-9_]+{"([^}]*`[^}]*)"}/g;
        let match;

        while ((match = nodeLabelRegex.exec(line)) !== null) {
          const label = match[1] || match[2];
          isApproved = false;
          detailFeedback.push(
            `Found backticks in Mermaid node label in ${source} at line ${lineNumber}: "${label}" - backticks in node labels cause rendering issues in Mermaid diagrams`
          );
        }
      }
    }

    // Check single line content (this needs to be done after the loop)
    const newlineCount = (text.match(/\n/g) || []).length;
    if (newlineCount === 0 && text.trim().length > 0) {
      isApproved = false;
      detailFeedback.push(
        `Found single line content in ${source}: content appears to be on only one line, check for missing line breaks`
      );
    }
  };

  // Check content
  checkLinks(reviewContent, "result");
  performAllChecks(reviewContent, "result");

  return {
    isApproved,
    detailFeedback: detailFeedback.join("\n"),
  };
}
