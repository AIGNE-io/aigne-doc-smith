import fs from "node:fs/promises";
import path from "node:path";

const docsDir = path.join(process.cwd(), "./.aigne/doc-smith", "docs");

export default async function getDocDetail({ path: docPath }) {
  try {
    // Flatten path: remove leading /, replace all / with - (same logic as utils.mjs)
    const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
    const fileFullName = `${flatName}.md`;
    const filePath = path.join(docsDir, fileFullName);

    // Read the markdown file
    const content = await fs.readFile(filePath, "utf8");

    return {
      success: true,
      path: docPath,
      content,
      filePath,
    };
  } catch (error) {
    return {
      success: false,
      path: docPath,
      error: error.message,
    };
  }
}

getDocDetail.input_schema = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "The path of the docs to get detail",
    },
  },
};

getDocDetail.description = "Get single docs detail";
