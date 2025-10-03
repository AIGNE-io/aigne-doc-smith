import { applyPatch } from "diff";
import {
  getUpdateDocumentContentInputJsonSchema,
  getUpdateDocumentContentOutputJsonSchema,
  validateUpdateDocumentContentInput,
} from "../../../types/document-schema.mjs";

export default async function updateDocumentContent(input, options) {
  // Get originalContent from shared context, fallback to input
  let originalContent = options?.context?.userContext?.currentContent;

  if (!originalContent) {
    originalContent = input.originalContent;
  }

  // Validate input using Zod schema
  const validation = validateUpdateDocumentContentInput(input);
  if (!validation.success) {
    return {
      success: false,
      error: { message: validation.error },
    };
  }

  const { diffPatch } = validation.data;

  try {
    // Parse and validate diff patch
    const parsedDiff = parseDiffPatch(diffPatch);
    if (!parsedDiff.success) {
      return {
        success: false,
        error: { message: parsedDiff.error },
      };
    }

    // Check and fix line number issues
    const fixedDiff = fixLineNumberIssues(originalContent, parsedDiff.hunks);
    if (!fixedDiff.success) {
      return {
        success: false,
        error: { message: fixedDiff.error },
      };
    }

    // Reconstruct the fixed diff patch
    const fixedPatch = reconstructDiffPatch(fixedDiff.hunks);

    // Apply the diff patch using the diff library
    const result = applyPatch(originalContent, fixedPatch);

    if (result === false) {
      return {
        success: false,
        error: { message: "Failed to apply patch" },
      };
    }

    // Update shared context with new content if options is provided
    if (options?.context?.userContext) {
      options.context.userContext.currentContent = result;
    }

    return {
      success: true,
      updatedContent: `<page_content>
${result}
</page_content>`,
      message:
        "Document content updated successfully.\nCheck if updatedContent meets user feedback, if so, just return 'success'.",
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
    };
  }
}

function parseDiffPatch(diffPatch) {
  try {
    const hunks = [];
    const lines = diffPatch.split("\n");
    let currentHunk = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const hunkMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
      if (hunkMatch) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        currentHunk = {
          oldStart: parseInt(hunkMatch[1], 10),
          oldCount: parseInt(hunkMatch[2], 10) || 1,
          newStart: parseInt(hunkMatch[3], 10),
          newCount: parseInt(hunkMatch[4], 10) || 1,
          changes: [],
        };
        continue;
      }

      // Parse changes
      if (currentHunk && line.length > 0) {
        const changeType = line[0];
        const content = line.slice(1);

        if (changeType === "-") {
          currentHunk.changes.push({ type: "remove", content });
        } else if (changeType === "+") {
          currentHunk.changes.push({ type: "add", content });
        } else if (changeType === " ") {
          currentHunk.changes.push({ type: "context", content });
        }
      }
    }

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    if (hunks.length === 0) {
      return { success: false, error: "No valid hunks found in diff" };
    }

    return { success: true, hunks };
  } catch (error) {
    return { success: false, error: `Failed to parse diff: ${error.message}` };
  }
}

function fixLineNumberIssues(originalContent, hunks) {
  try {
    const originalLines = originalContent.split("\n");
    const fixedHunks = [];

    for (const hunk of hunks) {
      // Extract context and removed lines to find best match
      const contextAndRemoved = hunk.changes
        .filter((change) => change.type === "context" || change.type === "remove")
        .map((change) => change.content);

      if (contextAndRemoved.length === 0) {
        // No context to match against, keep original
        fixedHunks.push(hunk);
        continue;
      }

      // Find best matching position in original content
      const bestMatch = findBestMatch(originalLines, contextAndRemoved, hunk.oldStart - 1);

      if (bestMatch.found) {
        const fixedHunk = {
          ...hunk,
          oldStart: bestMatch.position + 1,
          newStart: bestMatch.position + 1,
          // Fix line counts based on actual changes
          oldCount: calculateOldCount(hunk.changes),
          newCount: calculateNewCount(hunk.changes),
        };
        fixedHunks.push(fixedHunk);
      } else {
        // Try fuzzy matching
        const fuzzyMatch = findFuzzyMatch(originalLines, contextAndRemoved);
        if (fuzzyMatch.found) {
          const fixedHunk = {
            ...hunk,
            oldStart: fuzzyMatch.position + 1,
            newStart: fuzzyMatch.position + 1,
            // Fix line counts based on actual changes
            oldCount: calculateOldCount(hunk.changes),
            newCount: calculateNewCount(hunk.changes),
          };
          fixedHunks.push(fixedHunk);
        } else {
          return {
            success: false,
            error: `Cannot find matching context for hunk at line ${hunk.oldStart}`,
          };
        }
      }
    }

    return { success: true, hunks: fixedHunks };
  } catch (error) {
    return { success: false, error: `Failed to fix line numbers: ${error.message}` };
  }
}

function findBestMatch(originalLines, targetLines, startPosition) {
  // Try exact match at expected position first
  if (startPosition >= 0 && startPosition + targetLines.length <= originalLines.length) {
    let matches = 0;
    for (let i = 0; i < targetLines.length; i++) {
      if (originalLines[startPosition + i] === targetLines[i]) {
        matches++;
      }
    }

    if (matches === targetLines.length) {
      return { found: true, position: startPosition };
    }
  }

  // Try nearby positions (within 10 lines)
  const NEARBY_SEARCH_RANGE = 10; // Maximum number of lines to search before/after expected position
  for (let offset = 1; offset <= NEARBY_SEARCH_RANGE; offset++) {
    // Try before
    const beforePos = startPosition - offset;
    if (beforePos >= 0 && beforePos + targetLines.length <= originalLines.length) {
      let matches = 0;
      for (let i = 0; i < targetLines.length; i++) {
        if (originalLines[beforePos + i] === targetLines[i]) {
          matches++;
        }
      }
      if (matches === targetLines.length) {
        return { found: true, position: beforePos };
      }
    }

    // Try after
    const afterPos = startPosition + offset;
    if (afterPos >= 0 && afterPos + targetLines.length <= originalLines.length) {
      let matches = 0;
      for (let i = 0; i < targetLines.length; i++) {
        if (originalLines[afterPos + i] === targetLines[i]) {
          matches++;
        }
      }
      if (matches === targetLines.length) {
        return { found: true, position: afterPos };
      }
    }
  }

  return { found: false };
}

function findFuzzyMatch(originalLines, targetLines) {
  // Find the best partial match
  let bestMatch = { found: false, position: 0, score: 0 };

  for (let pos = 0; pos <= originalLines.length - targetLines.length; pos++) {
    let matches = 0;
    for (let i = 0; i < targetLines.length; i++) {
      if (originalLines[pos + i] === targetLines[i]) {
        matches++;
      }
    }

    const score = matches / targetLines.length;
    const FUZZY_MATCH_THRESHOLD = 0.7; // 70% similarity threshold for fuzzy matching
    if (score > bestMatch.score && score >= FUZZY_MATCH_THRESHOLD) {
      bestMatch = { found: true, position: pos, score };
    }
  }

  return bestMatch;
}

function calculateOldCount(changes) {
  const contextCount = changes.filter((c) => c.type === "context").length;
  const removeCount = changes.filter((c) => c.type === "remove").length;
  return contextCount + removeCount;
}

function calculateNewCount(changes) {
  const contextCount = changes.filter((c) => c.type === "context").length;
  const addCount = changes.filter((c) => c.type === "add").length;
  return contextCount + addCount;
}

function reconstructDiffPatch(hunks) {
  let patchContent = "";

  for (const hunk of hunks) {
    // Add hunk header
    const oldRange = hunk.oldCount === 1 ? hunk.oldStart : `${hunk.oldStart},${hunk.oldCount}`;
    const newRange = hunk.newCount === 1 ? hunk.newStart : `${hunk.newStart},${hunk.newCount}`;
    patchContent += `@@ -${oldRange} +${newRange} @@\n`;

    // Add changes
    for (const change of hunk.changes) {
      if (change.type === "context") {
        patchContent += ` ${change.content}\n`;
      } else if (change.type === "remove") {
        patchContent += `-${change.content}\n`;
      } else if (change.type === "add") {
        patchContent += `+${change.content}\n`;
      }
    }
  }

  return patchContent;
}

updateDocumentContent.inputSchema = getUpdateDocumentContentInputJsonSchema();
updateDocumentContent.outputSchema = getUpdateDocumentContentOutputJsonSchema();

updateDocumentContent.description = "Apply diff patch to update markdown document content";
