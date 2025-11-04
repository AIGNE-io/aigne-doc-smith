import { join } from "node:path";
import fs from "fs-extra";
import { buildDocumentTree } from "../../utils/docs-finder-utils.mjs";

export default async function saveSidebar({ documentStructure, docsDir }) {
  // Generate _sidebar.md
  try {
    const sidebar = generateSidebar(documentStructure);
    const sidebarPath = join(docsDir, "_sidebar.md");

    await fs.ensureDir(docsDir);
    await fs.writeFile(sidebarPath, sidebar, "utf8");
  } catch (err) {
    console.error("Failed to save _sidebar.md:", err.message);
  }
  return {};
}

// Recursively generate sidebar text, the link path is the flattened file name
function walk(nodes, indent = "") {
  let out = "";
  for (const node of nodes) {
    const relPath = node.path.replace(/^\//, "");
    const flatFile = `${relPath.split("/").join("-")}.md`;
    const realIndent = node.parentId === null ? "" : indent;
    out += `${realIndent}* [${node.title}](/${flatFile})\n`;

    if (node.children && node.children.length > 0) {
      out += walk(node.children, `${indent}  `);
    }
  }
  return out;
}

function generateSidebar(documentStructure) {
  const { rootNodes } = buildDocumentTree(documentStructure);
  return walk(rootNodes).replace(/\n+$/, "");
}
