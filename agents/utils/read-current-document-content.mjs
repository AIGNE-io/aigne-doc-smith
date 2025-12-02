import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getFileName } from "../../utils/utils.mjs";
import { readFileContent } from "../../utils/docs-finder-utils.mjs";

/**
 * Read current document content from file system
 * Used when skipping document generation (e.g., for diagram-only updates)
 * Only reads content if intentType is diagram-related, otherwise returns input unchanged
 */
export default async function readCurrentDocumentContent(input, options) {
  const { path, docsDir, locale = "en", intentType } = input;

  // Only read content if intentType is diagram-related
  // Otherwise, return input unchanged to allow document generation to proceed
  if (!intentType || !["addDiagram", "updateDiagram", "deleteDiagram"].includes(intentType)) {
    return input;
  }

  if (!path || !docsDir) {
    return input;
  }

  try {
    // Read document content using the same utility as other parts of the system
    const fileName = getFileName(path, locale);
    const content = await readFileContent(docsDir, fileName);

    if (!content) {
      console.warn(`⚠️  Could not read content from ${fileName}`);
      return input;
    }

    // Return content as both content, documentContent, and originalContent
    // This matches the structure expected by downstream agents
    return {
      ...input,
      content,
      documentContent: content,
      originalContent: content,
    };
  } catch (error) {
    console.warn(`Failed to read current content for ${path}: ${error.message}`);
    return input;
  }
}

readCurrentDocumentContent.task_render_mode = "hide";

