import { readdir } from "node:fs/promises";
import { join } from "node:path";

const MAX_DEPTH = 2;
const MAX_CHARS = 10000;
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  "out",
  "__pycache__",
  "venv",
  ".venv",
  ".turbo",
  ".cache",
]);
const INCLUDE_HIDDEN = new Set([".github"]);

export default async function initWorkspaceCache(_input, options) {
  try {
    const startTime = Date.now();
    const directoryTree = await buildDirectoryTree(options);
    const elapsed = Date.now() - startTime;

    // 存储到 userContext
    options.context.userContext.workspaceCache = {
      static: {
        tree: directoryTree,
        metadata: {
          cachedAt: new Date().toISOString(),
          size: directoryTree.length,
          maxDepth: MAX_DEPTH,
          buildTimeMs: elapsed,
        },
      },
    };

    console.log(
      `Workspace directory tree cached: ${directoryTree.length} chars, max depth ${MAX_DEPTH}, took ${elapsed}ms`,
    );

    return { message: "Workspace cache initialized" };
  } catch (error) {
    console.warn("Failed to initialize workspace cache:", error.message);
    // 失败时设置空缓存，不阻塞执行
    options.context.userContext.workspaceCache = {
      static: {
        tree: "",
        metadata: {
          error: error.message,
          cachedAt: new Date().toISOString(),
        },
      },
    };
    return { message: "Workspace cache initialization failed, will use on-demand loading" };
  }
}

async function buildDirectoryTree(_options) {
  const entries = [];
  const cwd = process.cwd();

  // 递归扫描目录
  // 从当前工作目录开始扫描
  async function scanDir(dirPath, relativePath, depth) {
    if (depth > MAX_DEPTH) return;

    try {
      const items = await readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
        const itemFullPath = join(dirPath, item.name);

        // 过滤规则
        if (item.isDirectory()) {
          // 排除大目录和隐藏目录（除了白名单）
          if (EXCLUDE_DIRS.has(item.name)) continue;
          if (item.name.startsWith(".") && !INCLUDE_HIDDEN.has(item.name)) continue;
        }

        entries.push({
          path: `/${itemRelativePath}`,
          name: item.name,
          isDirectory: item.isDirectory(),
          depth,
        });

        // 递归扫描子目录
        if (item.isDirectory()) {
          await scanDir(itemFullPath, itemRelativePath, depth + 1);
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
      console.warn(`Failed to scan directory ${dirPath}:`, error.message);
    }
  }

  await scanDir(cwd, "", 0);

  // 构建树形视图
  let treeView = buildTreeView(entries);

  // 如果超过最大字符数，截断并添加说明
  if (treeView.length > MAX_CHARS) {
    const lines = treeView.split("\n");
    const truncatedLines = [];
    let currentLength = 0;

    for (const line of lines) {
      if (currentLength + line.length + 1 > MAX_CHARS) break;
      truncatedLines.push(line);
      currentLength += line.length + 1;
    }

    treeView = `${truncatedLines.join("\n")}\n... (截断，总共 ${entries.length} 项，最大深度 ${MAX_DEPTH})`;
  }

  return treeView;
}

function buildTreeView(entries) {
  // 构建树形结构
  const tree = {};

  for (const entry of entries) {
    const parts = entry.path.split("/").filter(Boolean);
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { _meta: null, children: {} };
      }
      if (i === parts.length - 1) {
        current[part]._meta = entry;
      }
      current = current[part].children;
    }
  }

  // 渲染树形视图
  function renderTree(node, prefix = "", _parentPrefix = "") {
    let result = "";
    const keys = Object.keys(node);

    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const entry = node[key]._meta;
      const suffix = entry?.isDirectory ? "/" : "";
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      result += `${prefix}${connector}${key}${suffix}\n`;

      if (Object.keys(node[key].children).length > 0) {
        result += renderTree(node[key].children, prefix + childPrefix, prefix);
      }
    });

    return result;
  }

  return renderTree(tree);
}
