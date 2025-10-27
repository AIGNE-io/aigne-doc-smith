import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";
import { getCurrentGitHead, saveGitHeadToConfig } from "../../utils/utils.mjs";

/**
 * @param {Object} params
 * @param {Array<{path: string, content: string, title: string}>} params.documentStructure
 * @param {string} params.docsDir
 * @param {Array<string>} [params.translateLanguages] - Translation languages
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
export default async function postGenerate({
  documentExecutionStructure: documentStructure,
  docsDir,
  translateLanguages = [],
  locale,
  projectInfoMessage,
}) {
  const _results = [];
  // Save current git HEAD to config.yaml for change detection
  try {
    const gitHead = getCurrentGitHead();
    await saveGitHeadToConfig(gitHead);
  } catch (err) {
    console.warn("Failed to save git HEAD:", err.message);
  }

  // Clean up invalid .md files that are no longer in the documentation structure
  try {
    await cleanupInvalidFiles(documentStructure, docsDir, translateLanguages, locale);
  } catch (err) {
    console.error("Failed to cleanup invalid .md files:", err.message);
  }

  const message = `
✅ Documentation generated successfully! (\`${documentStructure.length}\` documents → \`${docsDir}\`)
${projectInfoMessage || ""}
🚀 Next: Make your documentation live and generate a shareable link, run: \`aigne doc publish\`
💡 Optional: Update specific document (\`aigne doc update\`) or refine documentation structure (\`aigne doc generate\`)
  `;

  // Shutdown mermaid worker pool to ensure clean exit
  try {
    await shutdownMermaidWorkerPool();
  } catch (error) {
    console.warn("Failed to shutdown mermaid worker pool:", error.message);
  }

  return {
    message,
  };
}

/**
 * Generate filename based on flatName and language
 * @param {string} flatName - Flattened path name
 * @param {string} language - Language code
 * @returns {string} - Generated filename
 */
function generateFileName(flatName, language) {
  const isEnglish = language === "en";
  return isEnglish ? `${flatName}.md` : `${flatName}.${language}.md`;
}

/**
 * Clean up .md files that are no longer in the documentation structure
 * @param {Array<{path: string, title: string}>} documentStructure
 * @param {string} docsDir
 * @param {Array<string>} translateLanguages
 * @param {string} locale - Main language locale (e.g., 'en', 'zh', 'fr')
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
async function cleanupInvalidFiles(documentStructure, docsDir, translateLanguages, locale) {
  const results = [];

  try {
    // Get all .md files in docsDir
    const files = await readdir(docsDir);
    const mdFiles = files.filter((file) => file.endsWith(".md"));

    // Generate expected file names from documentation structure
    const expectedFiles = new Set();

    // Add main document files
    for (const { path } of documentStructure) {
      const flatName = path.replace(/^\//, "").replace(/\//g, "-");

      // Main language file
      const mainFileName = generateFileName(flatName, locale);
      expectedFiles.add(mainFileName);

      // Add translation files for each language
      for (const lang of translateLanguages) {
        const translateFileName = generateFileName(flatName, lang);
        expectedFiles.add(translateFileName);
      }
    }

    // Find files to delete (files that are not in expectedFiles and not _sidebar.md)
    const filesToDelete = mdFiles.filter(
      (file) => !expectedFiles.has(file) && file !== "_sidebar.md",
    );

    // Delete invalid files
    for (const file of filesToDelete) {
      try {
        const filePath = join(docsDir, file);
        await unlink(filePath);
        results.push({
          path: filePath,
          success: true,
          message: `Deleted invalid file: ${file}`,
        });
      } catch (err) {
        console.warn(`Failed to delete invalid file: ${file}, error: ${err.message}`);
      }
    }

    if (filesToDelete.length > 0) {
      console.log(`Cleaned up ${filesToDelete.length} invalid .md files from ${docsDir}`);
    }
  } catch (err) {
    // If docsDir doesn't exist or can't be read, that's okay
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  return results;
}

// Generate sidebar content, support nested structure, and the order is consistent with documentStructure
