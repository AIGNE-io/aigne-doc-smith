import fs from "node:fs/promises";
import path from "node:path";

const docsDir = path.join(process.cwd(), "./.aigne/doc-smith", "docs");

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
      const content = await fs.readFile(filePath, "utf8");

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
