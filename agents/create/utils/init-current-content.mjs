import { readFileContent } from "../../../utils/docs-finder-utils.mjs";
import { getFileName, userContextAt } from "../../../utils/utils.mjs";

/**
 * Initialize currentContents in userContext for document update
 * Reads document content from file system and sets it in userContext
 * Uses getFileName utility to generate filename consistently
 */
export default async function initCurrentContent(input, options) {
  const { path, docsDir, locale = "en" } = input;

  if (!path) {
    return {};
  }

  // Generate filename using unified utility function
  const fileName = getFileName(path, locale);

  // Read document content
  const content = docsDir ? await readFileContent(docsDir, fileName) : null;

  if (!content) {
    console.warn(`⚠️  Could not read content from ${fileName}`);
    return {};
  }

  // Initialize currentContents[path] in userContext
  const contentContext = userContextAt(options, `currentContents.${path}`);
  contentContext.set(content);

  return {};
}

initCurrentContent.task_render_mode = "hide";
