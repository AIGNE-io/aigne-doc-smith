import pMap from "p-map";
import { findItemByPath } from "../../utils/docs-finder-utils.mjs";

/**
 * Loads all document content from the file system based on the provided document structure.
 *
 * @async
 * @function loadAllDocumentContent
 * @param {Object} params - The parameters object
 * @param {string} params.docsDir - The root directory path where documents are located
 * @param {Array<Object>} params.documentStructure - The document structure array containing items with path information
 * @param {string} params.documentStructure[].path - The file path of each document item
 * @returns {Promise<Object>} A promise that resolves to an object containing allDocumentContent
 * @returns {Promise<Array>} returns.allDocumentContent - An array of document content items loaded from the file system
 * @example
 * const result = await loadAllDocumentContent({
 *   docsDir: './docs',
 *   documentStructure: [{ path: 'readme.md' }, { path: 'guide.md' }]
 * });
 */
export default async function loadAllDocumentContent({ docsDir, documentStructure = [] }) {
  const allDocumentContentList = await pMap(documentStructure, async (item) => {
    const itemResult = await findItemByPath(documentStructure, item.path, null, docsDir);
    return itemResult;
  });
  return {
    allDocumentContentList,
    // allDocumentContent: allDocumentContentList.map(x => `# docPath: ${x.path}\n\n${x.content}`).join("\n\n---\n\n"), // All document content combined
  };
}

loadAllDocumentContent.taskRenderMode = "hide";
