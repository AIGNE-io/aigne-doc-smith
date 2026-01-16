import { readdir, readFile, rm, stat } from "node:fs/promises";
import { parse as yamlParse } from "yaml";
import path from "node:path";
import { loadDocumentPaths } from "../../utils/document-paths.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 无效文档清理器
 * 在内容检查前删除不应存在的文档文件和文件夹
 */

/**
 * 递归扫描 docs 目录，收集所有文档文件夹路径
 * @param {string} docsDir - 文档根目录
 * @param {string} relativePath - 当前相对路径
 * @returns {Promise<string[]>} - 文档路径数组（不带斜杠前缀）
 */
async function scanDocsFolders(docsDir, relativePath = "") {
  const folders = [];
  const currentDir = path.join(docsDir, relativePath);

  try {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue; // 跳过隐藏文件夹

      const folderRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const folderFullPath = path.join(currentDir, entry.name);

      // 检查是否是文档文件夹（包含 .meta.yaml）
      const metaPath = path.join(folderFullPath, ".meta.yaml");
      try {
        await stat(metaPath);
        // 存在 .meta.yaml，是文档文件夹
        folders.push(folderRelativePath);
      } catch (_error) {
        // 不存在 .meta.yaml，可能是中间目录，继续递归
      }

      // 递归扫描子目录
      const subFolders = await scanDocsFolders(docsDir, folderRelativePath);
      folders.push(...subFolders);
    }
  } catch (_error) {
    // 目录不存在或无法读取，返回空数组
  }

  return folders;
}

/**
 * 获取 .meta.yaml 中定义的有效语言列表
 * @param {string} metaPath - .meta.yaml 文件路径
 * @returns {Promise<Set<string>|null>} - 有效语言集合，解析失败返回 null
 */
async function getValidLanguages(metaPath) {
  try {
    const content = await readFile(metaPath, "utf8");
    const meta = yamlParse(content);

    const languages = new Set();

    // 从 source 和 default 字段获取语言
    if (meta.source) languages.add(meta.source);
    if (meta.default) languages.add(meta.default);

    // 如果有 languages 字段，也添加进来
    if (meta.languages && Array.isArray(meta.languages)) {
      for (const lang of meta.languages) {
        languages.add(lang);
      }
    }

    return languages.size > 0 ? languages : null;
  } catch (_error) {
    return null;
  }
}

/**
 * 从文件名提取语言代码
 * @param {string} filename - 文件名
 * @returns {string|null} - 语言代码（去掉 .md 后缀的文件名），如 "zh", "en", "claude-code"
 */
function extractLanguageFromFilename(filename) {
  if (!filename.endsWith(".md")) return null;
  // 返回去掉 .md 后缀的文件名作为语言标识
  return filename.slice(0, -3);
}

/**
 * 清理无效文档
 * @param {Object} options - 清理选项
 * @param {string} options.yamlPath - 文档结构文件路径
 * @param {string} options.docsDir - 文档目录路径
 * @param {boolean} options.dryRun - 是否为预览模式（只报告不删除）
 * @returns {Promise<Object>} - 清理结果
 */
export async function cleanInvalidDocs({
  yamlPath = PATHS.DOCUMENT_STRUCTURE,
  docsDir = PATHS.DOCS_DIR,
  dryRun = false,
} = {}) {
  const result = {
    dryRun,
    deletedFolders: [],
    deletedFiles: [],
    errors: [],
  };

  try {
    // 1. 加载文档结构中的有效路径
    let validPaths;
    try {
      validPaths = await loadDocumentPaths({ yamlPath, includeBothFormats: false });
    } catch (_error) {
      // 文档结构文件不存在，无法清理
      return result;
    }

    // 2. 扫描 docs 目录中实际存在的文档文件夹
    const existingFolders = await scanDocsFolders(docsDir);

    // 3. 找出无效的文档文件夹（存在于文件系统但不在 document-structure.yaml 中）
    const invalidFolders = existingFolders.filter((folder) => !validPaths.has(folder));

    // 4. 删除无效的文档文件夹（或在 dry-run 模式下只记录）
    for (const folder of invalidFolders) {
      const folderPath = path.join(docsDir, folder);
      if (dryRun) {
        // dry-run 模式：只记录，不删除
        result.deletedFolders.push(folder);
      } else {
        try {
          await rm(folderPath, { recursive: true });
          result.deletedFolders.push(folder);
        } catch (error) {
          result.errors.push({
            type: "DELETE_FOLDER_ERROR",
            path: folder,
            message: error.message,
          });
        }
      }
    }

    // 5. 对于有效的文档文件夹，清理无效的语言文件
    const validFolders = existingFolders.filter((folder) => validPaths.has(folder));

    for (const folder of validFolders) {
      const folderPath = path.join(docsDir, folder);
      const metaPath = path.join(folderPath, ".meta.yaml");

      // 获取有效语言列表
      const validLanguages = await getValidLanguages(metaPath);
      if (!validLanguages) continue; // 无法解析 meta，跳过

      // 扫描文件夹中的所有 .md 文件
      try {
        const files = await readdir(folderPath);

        for (const file of files) {
          // 跳过非 .md 文件和隐藏文件
          if (!file.endsWith(".md") || file.startsWith(".")) continue;

          const lang = extractLanguageFromFilename(file);
          if (!lang) continue; // 不是语言文件格式，跳过

          // 检查语言是否在有效列表中
          if (!validLanguages.has(lang)) {
            const filePath = path.join(folderPath, file);
            if (dryRun) {
              // dry-run 模式：只记录，不删除
              result.deletedFiles.push(`${folder}/${file}`);
            } else {
              try {
                await rm(filePath);
                result.deletedFiles.push(`${folder}/${file}`);
              } catch (error) {
                result.errors.push({
                  type: "DELETE_FILE_ERROR",
                  path: `${folder}/${file}`,
                  message: error.message,
                });
              }
            }
          }
        }
      } catch (error) {
        result.errors.push({
          type: "READ_FOLDER_ERROR",
          path: folder,
          message: error.message,
        });
      }
    }
  } catch (error) {
    result.errors.push({
      type: "CLEAN_ERROR",
      message: error.message,
    });
  }

  return result;
}

/**
 * 格式化清理结果为字符串
 * @param {Object} result - 清理结果
 * @returns {string} - 格式化的输出
 */
export function formatCleanResult(result) {
  const { dryRun, deletedFolders, deletedFiles, errors } = result;

  if (deletedFolders.length === 0 && deletedFiles.length === 0 && errors.length === 0) {
    return "";
  }

  let output = "";
  const actionVerb = dryRun ? "将删除" : "删除";
  const modeIndicator = dryRun ? " [预览模式]" : "";

  if (deletedFolders.length > 0 || deletedFiles.length > 0) {
    output += `Layer 0: 无效文档清理${modeIndicator}\n`;

    if (deletedFolders.length > 0) {
      output += `  ${actionVerb}无效文档文件夹: ${deletedFolders.length}\n`;
      for (const folder of deletedFolders) {
        output += `    - ${folder}/\n`;
      }
    }

    if (deletedFiles.length > 0) {
      output += `  ${actionVerb}无效语言文件: ${deletedFiles.length}\n`;
      for (const file of deletedFiles) {
        output += `    - ${file}\n`;
      }
    }

    output += "\n";
  }

  if (errors.length > 0) {
    output += "清理错误:\n";
    for (const error of errors) {
      output += `  - ${error.path || ""}: ${error.message}\n`;
    }
    output += "\n";
  }

  return output;
}
