import { readdirSync } from "node:fs";
import { findItemByPath, readFileContent } from "../../utils/docs-finder-utils.mjs";

/**
 * Loads a document's content along with all its translations from the docs directory.
 *
 * This function finds a document by its path in the document structure, then searches
 * for all translation files in the docs directory that match the document's naming pattern.
 * Translation files are identified by the pattern: {flatName}.{language-code}.md
 *
 * @param {Object} params - The parameters object
 * @param {string} params.path - The document path to find in the structure
 * @param {string} params.docsDir - The directory containing document files and translations
 * @param {Object} params.documentStructure - The document structure object to search in
 * @returns {Promise<Object>} An object containing the document data with translations
 * @throws {Error} Throws an error if the document path is not found in the structure
 */
export default async function loadDocumentAllContent({ path, docsDir, documentStructure }) {
  // Find the document item by path in the document structure
  const result = await findItemByPath(documentStructure, path, null, docsDir);

  if (!result) {
    throw new Error(`Document with path "${path}" not found in documentStructure`);
  }

  // Convert path to flat filename format (remove leading slash, replace slashes with dashes)
  // e.g., "/api/users" becomes "api-users"
  const flatName = result.path.replace(/^\//, "").replace(/\//g, "-");

  // Arrays to store translation data in different formats
  const translations = [];
  const translationsString = [];

  try {
    // Read all files in the docs directory
    const files = readdirSync(docsDir);

    // Filter files to find translation files matching the pattern:
    // - Starts with the flat name
    // - Ends with .md
    // - Is not the main document file (flatName.md)
    // - Matches language pattern: .{language-code}.md (e.g., .en.md, .zh-CN.md)
    const translationFiles = files.filter(
      (file) =>
        file.startsWith(`${flatName}.`) &&
        file.endsWith(".md") &&
        file !== `${flatName}.md` &&
        file.match(/\.\w+(-\w+)?\.md$/),
    );

    // Process each translation file
    for (const file of translationFiles) {
      const content = await readFileContent(docsDir, file);
      if (content) {
        // Extract language code from filename (e.g., "en" from "doc.en.md" or "zh-CN" from "doc.zh-CN.md")
        const langMatch = file.match(/\.(\w+(-\w+)?)\.md$/);
        if (langMatch) {
          const language = langMatch[1];
          // Store translation in structured format
          translations.push({
            language,
            translation: content,
          });

          // Store translation in XML-like string format for prompt templates
          translationsString.push(`<${language}>\n${content}\n</${language}>`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read translation files from ${docsDir}:`, error.message);
  }

  // Return the original document result enhanced with translation data
  return {
    ...result,
    // FIXME: @zhanghan use anthoer way to evaluate translationQuality
    // translates: translations, // Array of translation objects with language and content
    translationsString: translationsString.join("\n\n"), // Combined translations as formatted string
  };
}

// Hide this function from task rendering in the UI
loadDocumentAllContent.taskRenderMode = "hide";
