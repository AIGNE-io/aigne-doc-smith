import { readdir, unlink, writeFile } from "node:fs/promises";
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
export default async function saveDocs({
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

  // Generate _sidebar.md
  try {
    const sidebar = generateSidebar(documentStructure);
    const sidebarPath = join(docsDir, "_sidebar.md");
    await writeFile(sidebarPath, sidebar, "utf8");
  } catch (err) {
    console.error("Failed to save _sidebar.md:", err.message);
  }

  // Clean up invalid .md files that are no longer in the document structure
  try {
    await cleanupInvalidFiles(documentStructure, docsDir, translateLanguages, locale);
  } catch (err) {
    console.error("Failed to cleanup invalid .md files:", err.message);
  }

  const message = `# ✅ Documentation Generated Successfully!

Successfully generated **${documentStructure.length}** documents and saved to: \`${docsDir}\`
${projectInfoMessage || ""}
## 🚀 Next Steps

**Publish Documentation**

  \`aigne doc publish\`

Get an online preview link to share with your team

## 🔧 Optional Improvements

**Update Specific Documents**

  \`aigne doc update\`

Regenerate content for specific documents

**Optimize Document Structure**

  \`aigne doc generate\`

Review and optimize the overall documentation structure

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
 * Clean up .md files that are no longer in the document structure
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

    // Generate expected file names from document structure
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
function generateSidebar(documentStructure) {
  // Build tree structure
  const root = {};
  for (const { path, title, parentId } of documentStructure) {
    const relPath = path.replace(/^\//, "");
    const segments = relPath.split("/");
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!node[seg])
        node[seg] = {
          __children: {},
          __title: null,
          __fullPath: segments.slice(0, i + 1).join("/"),
          __parentId: parentId,
        };
      if (i === segments.length - 1) node[seg].__title = title;
      node = node[seg].__children;
    }
  }
  // Recursively generate sidebar text, the link path is the flattened file name
  function walk(node, parentSegments = [], indent = "") {
    let out = "";
    for (const key of Object.keys(node)) {
      const item = node[key];
      const fullSegments = [...parentSegments, key];
      const flatFile = `${fullSegments.join("-")}.md`;
      if (item.__title) {
        const realIndent = item.__parentId === null ? "" : indent;
        out += `${realIndent}* [${item.__title}](/${flatFile})\n`;
      }
      const children = item.__children;
      if (Object.keys(children).length > 0) {
        out += walk(children, fullSegments, `${indent}  `);
      }
    }
    return out;
  }
  return walk(root).replace(/\n+$/, "");
}
