import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse } from "yaml";
import { PATHS, ERROR_CODES } from "./agent-constants.mjs";

/**
 * 标准化路径
 * @param {string} rawPath - 原始路径（可能带或不带斜杠）
 * @returns {Object} - { filePath: 不带斜杠的路径, displayPath: 带斜杠的路径 }
 */
export function normalizePath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  let normalized = rawPath.trim();

  // 移除开头的斜杠
  if (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }

  // 移除结尾的斜杠
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return {
    filePath: normalized, // "overview" 或 "api/authentication"
    displayPath: `/${normalized}`, // "/overview" 或 "/api/authentication"
  };
}

/**
 * 递归收集文档路径
 * @param {Array} docs - 文档数组
 * @param {Object} options - 收集选项
 * @param {boolean} options.includeBothFormats - 是否同时包含带斜杠和不带斜杠的版本
 * @param {boolean} options.collectMetadata - 是否收集额外的元数据
 * @returns {Set|Array} - 路径集合或路径对象数组
 */
export function collectDocumentPaths(docs, options = {}) {
  const { includeBothFormats = false, collectMetadata = false } = options;

  const paths = collectMetadata ? [] : new Set();

  function collect(documents) {
    for (const doc of documents) {
      if (doc.path) {
        // 标准化路径
        const normalized = doc.path.startsWith("/") ? doc.path.slice(1) : doc.path;

        if (collectMetadata) {
          // 收集路径和元数据
          paths.push({
            path: normalized,
            displayPath: `/${normalized}`,
            title: doc.title || "",
            description: doc.description || "",
          });
        } else {
          // 只收集路径
          paths.add(normalized);
          if (includeBothFormats) {
            paths.add(`/${normalized}`);
          }
        }
      }

      // 递归处理子文档
      if (doc.children && Array.isArray(doc.children)) {
        collect(doc.children);
      }
    }
  }

  collect(docs);
  return paths;
}

/**
 * 加载文档结构中的所有路径
 * @param {Object} options - 加载选项
 * @param {string} options.yamlPath - YAML 文件路径
 * @param {boolean} options.includeBothFormats - 是否同时包含带斜杠和不带斜杠的版本
 * @param {boolean} options.collectMetadata - 是否收集额外的元数据
 * @param {boolean} options.throwOnInvalid - 当文档格式无效时是否抛出错误
 * @returns {Promise<Set|Array>} - 所有有效路径的集合或路径对象数组
 */
export async function loadDocumentPaths(options = {}) {
  const {
    yamlPath = PATHS.DOCUMENT_STRUCTURE,
    includeBothFormats = false,
    collectMetadata = false,
    throwOnInvalid = true,
  } = options;

  // 检查文件是否存在
  try {
    await access(yamlPath, constants.F_OK | constants.R_OK);
  } catch (_error) {
    throw new Error(ERROR_CODES.MISSING_STRUCTURE_FILE);
  }

  // 读取并解析 YAML
  const content = await readFile(yamlPath, "utf8");
  const data = yamlParse(content);

  if (!data.documents || !Array.isArray(data.documents)) {
    if (throwOnInvalid) {
      throw new Error(ERROR_CODES.INVALID_STRUCTURE_FILE);
    } else {
      throw new Error(ERROR_CODES.MISSING_STRUCTURE_FILE);
    }
  }

  // 递归收集所有 path
  return collectDocumentPaths(data.documents, {
    includeBothFormats,
    collectMetadata,
  });
}

/**
 * 验证路径是否在文档结构中
 * @param {string} path - 要验证的路径
 * @param {Set|Array} validPaths - 有效路径集合
 * @returns {boolean} - 路径是否有效
 */
export function isValidDocumentPath(path, validPaths) {
  if (!path) return false;

  const { filePath, displayPath } = normalizePath(path);

  if (validPaths instanceof Set) {
    return validPaths.has(filePath) || validPaths.has(displayPath);
  }

  if (Array.isArray(validPaths)) {
    return validPaths.some((p) => {
      const pathValue = typeof p === "string" ? p : p.path;
      return pathValue === filePath || pathValue === displayPath;
    });
  }

  return false;
}

/**
 * 从路径数组中过滤出有效的路径
 * @param {string[]} paths - 要验证的路径数组
 * @param {Set|Array} validPaths - 有效路径集合
 * @returns {Object} - { validPaths: [], invalidPaths: [] }
 */
export function filterValidPaths(paths, validPaths) {
  const result = {
    validPaths: [],
    invalidPaths: [],
  };

  for (const path of paths) {
    const { filePath } = normalizePath(path);

    if (isValidDocumentPath(path, validPaths)) {
      result.validPaths.push(filePath);
    } else {
      result.invalidPaths.push(path);
    }
  }

  return result;
}
