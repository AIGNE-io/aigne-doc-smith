import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export default async function saveSidebar({ documentStructure, docsDir }) {
  // Generate _sidebar.md
  try {
    const sidebar = generateSidebar(documentStructure);
    const sidebarPath = join(docsDir, "_sidebar.md");
    await writeFile(sidebarPath, sidebar, "utf8");
  } catch (err) {
    console.error("Failed to save _sidebar.md:", err.message);
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

  return walk(root).replace(/\n+$/, "");
}
