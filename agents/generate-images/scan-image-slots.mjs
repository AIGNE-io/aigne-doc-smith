import { readFile, access, constants } from "node:fs/promises";
import { join } from "node:path";
import { loadDocumentPaths, filterValidPaths } from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { parseSlots } from "../../utils/image-slots.mjs";
import { calculateContentHash } from "../../utils/image-utils.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * 扫描单个文档的 slots
 * @param {string} docPath - 文档路径
 * @param {string} locale - 主语言
 * @returns {Promise<Object|null>} - { path, hash, content, slots } 或 null（文件不存在）
 */
async function scanDocument(docPath, locale) {
  // 构建文档文件路径：docs/{path}/{locale}.md
  const normalizedPath = docPath.startsWith("/") ? docPath.slice(1) : docPath;
  const filePath = join(PATHS.DOCS_DIR, normalizedPath, `${locale}.md`);

  // 检查文件是否存在
  try {
    await access(filePath, constants.F_OK | constants.R_OK);
  } catch (_error) {
    // 文件不存在，跳过（可能是尚未生成的文档）
    return null;
  }

  // 读取文档内容
  const content = await readFile(filePath, "utf8");

  // 计算 hash
  const hash = calculateContentHash(content);

  // 解析 slots
  const slots = parseSlots(content, docPath);

  return {
    path: docPath,
    hash,
    content,
    slots,
  };
}

/**
 * 按 key 分组 slots
 * @param {Array} scanResults - 扫描结果数组
 * @returns {Map} - key -> { key, id, desc, documents }
 */
function groupSlotsByKey(scanResults) {
  const slotMap = new Map();

  for (const result of scanResults) {
    if (!result || result.slots.length === 0) {
      continue;
    }

    for (const slot of result.slots) {
      const { key, id, desc } = slot;

      if (!slotMap.has(key)) {
        slotMap.set(key, {
          key,
          id,
          desc,
          documents: [],
        });
      }

      // 如果同一个 key 被多次使用，使用最后一个的 id 和 desc
      const existing = slotMap.get(key);
      existing.id = id;
      existing.desc = desc;

      // 添加文档引用
      existing.documents.push({
        path: result.path,
        hash: result.hash,
        content: result.content,
      });
    }
  }

  return slotMap;
}

/**
 * 扫描文档中的 AFS image slots
 * @param {Object} input - 输入参数
 * @param {string[]} input.docs - 要扫描的文档路径列表（可选）
 * @returns {Promise<Object>} - 扫描结果
 */
export default async function scanImageSlots(input) {
  try {
    const { docs } = input;

    // 1. 读取主语言
    let locale;
    try {
      locale = await loadLocale();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_CONFIG_FILE) {
        throw new Error(`配置文件不存在: ${PATHS.CONFIG} ,请确保在 doc-smith 项目根目录执行此命令`);
      }
      if (error.message === ERROR_CODES.MISSING_LOCALE) {
        throw new Error(
          `${PATHS.CONFIG} 中缺少 locale 字段,请向用户询问生成图片的主语言，并在 ${PATHS.CONFIG} 中添加 locale 字段，后再尝试重新执行命令`,
        );
      }
      throw error;
    }

    // 2. 加载文档结构
    let validPaths;
    try {
      validPaths = await loadDocumentPaths();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        throw new Error(
          `文档结构文件不存在: ${PATHS.DOCUMENT_STRUCTURE} ,请先 doc-smith skill 生成文档`,
        );
      }
      if (error.message === ERROR_CODES.INVALID_STRUCTURE_FILE) {
        throw new Error(
          `文档结构文件格式无效,请确保 ${PATHS.DOCUMENT_STRUCTURE} 包含有效的 documents 数组，否则无法扫描文档中的图片 slot，请参考 references/document-structure-schema.md 文件结构`,
        );
      }
      throw error;
    }

    // 3. 收集或验证文档路径
    let docPaths;
    if (!docs || docs.length === 0) {
      // 扫描所有文档
      docPaths = Array.from(validPaths);
    } else {
      // 验证指定的文档路径
      const { validPaths: validDocPaths, invalidPaths } = filterValidPaths(docs, validPaths);

      if (invalidPaths.length > 0) {
        throw new Error(
          `以下文档路径不存在于文档结构中: ${invalidPaths.join(", ")} ,请检查文档路径是否正确`,
        );
      }

      docPaths = validDocPaths;
    }

    // 4. 扫描所有文档
    const scanResults = await Promise.all(docPaths.map((path) => scanDocument(path, locale)));

    // 5. 按 key 分组
    const slotMap = groupSlotsByKey(scanResults);
    const slots = Array.from(slotMap.values());

    // 6. 返回结果
    return {
      success: true,
      locale,
      slots,
      totalDocs: docPaths.length,
      totalSlots: slots.length,
      message: `扫描了 ${docPaths.length} 个文档，找到 ${slots.length} 个图片 slot`,
    };
  } catch (error) {
    throw new Error(`扫描图片 slot 时发生错误: ${error.message}`);
  }
}

// 添加描述信息
scanImageSlots.description =
  "扫描主语言文档中的 AFS image slot，解析 id、key、desc，" +
  "计算文档内容 hash，按 key 分组并返回所有 slot 信息。";

// 定义输入 schema
scanImageSlots.input_schema = {
  type: "object",
  properties: {
    docs: {
      type: "array",
      items: { type: "string" },
      description: "要扫描的文档路径列表（可选，不传则扫描所有文档）",
    },
  },
};

// 定义输出 schema
scanImageSlots.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    locale: {
      type: "string",
      description: "主语言代码",
    },
    slots: {
      type: "array",
      description: "按 key 分组的 slot 列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "图片目录名" },
          id: { type: "string", description: "最后一个使用该 key 的 slot id" },
          desc: { type: "string", description: "slot 描述" },
          documents: {
            type: "array",
            description: "引用该 key 的文档列表",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                hash: { type: "string" },
                content: { type: "string" },
              },
            },
          },
        },
      },
    },
    totalDocs: {
      type: "number",
      description: "扫描的文档总数",
    },
    totalSlots: {
      type: "number",
      description: "找到的 slot 总数",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
    error: {
      type: "string",
      description: "错误代码（失败时存在）",
    },
    suggestion: {
      type: "string",
      description: "建议操作（失败时存在）",
    },
  },
};
