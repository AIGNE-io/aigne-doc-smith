import { join } from "node:path";
import fs from "fs-extra";
import { buildDocumentTree } from "../../utils/docs-finder-utils.mjs";

export default async function saveSidebar({
  documentStructure,
  originalDocumentStructure,
  docsDir,
}) {
  // Generate _sidebar.md
  try {
    const sidebar = generateSidebar(documentStructure || originalDocumentStructure);
    const sidebarPath = join(docsDir, "_sidebar.md");

    await fs.ensureDir(docsDir);
    await fs.writeFile(sidebarPath, sidebar, "utf8");
  } catch (err) {
    console.error("Failed to save _sidebar.md:", err.message);
  }
  return {};
}

// Recursively generate sidebar text
function walk(nodes, indent = "") {
  let out = "";
  for (const node of nodes) {
    const realIndent = node.parentId === null ? "" : indent;

    // If path already ends with .md, use it directly
    let linkPath;
    if (node.path.endsWith(".md")) {
      linkPath = node.path.startsWith("/") ? node.path : `/${node.path}`;
    } else {
      // Otherwise, convert to flattened file name
      const relPath = node.path.replace(/^\//, "");
      linkPath = `/${relPath.split("/").join("-")}.md`;
    }

    out += `${realIndent}* [${node.title}](${linkPath})\n`;

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
