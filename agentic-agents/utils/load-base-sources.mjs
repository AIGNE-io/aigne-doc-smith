import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

async function buildDirectoryTree(dirPath) {
  const entries = [];

  async function scanDir(currentPath, relativePath = "") {
    try {
      const items = await readdir(currentPath);

      for (const item of items) {
        const fullPath = join(currentPath, item);
        const itemRelativePath = relativePath ? `${relativePath}/${item}` : `/${item}`;
        const stats = await stat(fullPath);

        entries.push({
          path: itemRelativePath,
          isDirectory: stats.isDirectory(),
        });

        if (stats.isDirectory()) {
          await scanDir(fullPath, itemRelativePath);
        }
      }
    } catch {
      // 忽略读取错误
    }
  }

  await scanDir(dirPath);
  return entries;
}

function buildTreeView(entries) {
  const tree = {};
  const entryMap = new Map();

  for (const entry of entries) {
    entryMap.set(entry.path, entry);
    const parts = entry.path.split("/").filter(Boolean);
    let current = tree;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  function renderTree(node, prefix = "", currentPath = "") {
    let result = "";
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const fullPath = currentPath ? `${currentPath}/${key}` : `/${key}`;
      const entry = entryMap.get(fullPath);

      const suffix = entry?.isDirectory ? "/" : "";
      result += `${prefix}${isLast ? "└── " : "├── "}${key}${suffix}`;
      result += "\n";
      result += renderTree(node[key], `${prefix}${isLast ? "    " : "│   "}`, fullPath);
    });
    return result;
  }

  return renderTree(tree);
}

export default async function loadBaseSources() {
  const cwd = process.cwd();
  const docSmithPath = join(cwd, ".aigne/doc-smith");
  const structureFilePath = join(docSmithPath, "output/document_structure.yaml");

  // 读取 document_structure.yaml 文件内容
  let structureContent = "";
  try {
    structureContent = await readFile(structureFilePath, "utf-8");
  } catch {
    // 文件不存在时忽略错误
  }

  // 读取 .aigne/doc-smith 目录结构
  let directoryTree = "";
  try {
    const entries = await buildDirectoryTree(docSmithPath);
    directoryTree = buildTreeView(entries);
  } catch {
    // 目录不存在时忽略错误
  }

  return {
    structureContent,
    directoryTree,
  };
}
