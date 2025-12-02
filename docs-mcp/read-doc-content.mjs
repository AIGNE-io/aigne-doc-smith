import fs from "node:fs/promises";
import path from "node:path";

const docsDir = path.join(process.cwd(), "./.aigne/doc-smith", "docs");

/**
 * Remove base64 encoded images from markdown content
 * This prevents large binary data from being included in document content
 * Base64 images are completely removed (not replaced with placeholders) because:
 * 1. They significantly increase token usage without providing useful information to LLM
 * 2. Normal image references (file paths) are preserved and should be used instead
 * 3. Base64 images are typically temporary or erroneous entries
 * 
 * @param {string} content - Markdown content that may contain base64 images
 * @returns {string} - Content with base64 images completely removed
 */
function removeBase64Images(content) {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Match markdown image syntax with data URLs: ![alt](data:image/...;base64,...)
  const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/[^)]+\)/g;

  // Completely remove base64 images (including the entire markdown image syntax)
  // This maximizes token reduction while preserving normal image references
  const cleanedContent = content.replace(base64ImageRegex, "");

  return cleanedContent;
}

export default async function readDocContent({ relevantDocPaths, docsDir: customDocsDir }) {
  const targetDocsDir = customDocsDir || docsDir;
  const docContents = [];

  for (const docPath of relevantDocPaths) {
    try {
      // Flatten path: remove leading /, replace all / with - (same logic as utils.mjs)
      const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
      const fileFullName = `${flatName}.md`;
      const filePath = path.join(targetDocsDir, fileFullName);

      // Read the markdown file
      let content = await fs.readFile(filePath, "utf8");
      
      // Remove base64 encoded images to reduce token usage
      content = removeBase64Images(content);

      docContents.push({
        success: true,
        path: docPath,
        content,
        filePath,
      });
    } catch (error) {
      docContents.push({
        success: false,
        path: docPath,
        error: error.message,
      });
    }
  }

  // Combine all successful document contents into a single text
  const allDocumentsText = docContents
    .filter((doc) => doc.success)
    .map((doc) => doc.content)
    .join("\n\n---\n\n");

  return {
    docContents,
    allDocumentsText,
    totalDocs: relevantDocPaths.length,
    successfulReads: docContents.filter((doc) => doc.success).length,
  };
}

readDocContent.input_schema = {
  type: "object",
  properties: {
    relevantDocPaths: {
      type: "array",
      items: { type: "string" },
      description: "List of document paths to read",
    },
    docsDir: {
      type: "string",
      description: "Custom docs directory path (optional)",
    },
  },
  required: ["relevantDocPaths"],
};

readDocContent.output_schema = {
  type: "object",
  properties: {
    docContents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          path: { type: "string" },
          content: { type: "string" },
          filePath: { type: "string" },
          error: { type: "string" },
        },
      },
    },
    allDocumentsText: {
      type: "string",
      description: "Combined text content of all successfully read documents",
    },
    totalDocs: { type: "number" },
    successfulReads: { type: "number" },
  },
};

readDocContent.description = "Read markdown content for multiple documents";
