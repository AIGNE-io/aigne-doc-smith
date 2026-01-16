import { readFile, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 检查图片目录是否存在
 * @param {string} key - 图片 key
 * @returns {Promise<boolean>}
 */
async function imageDirectoryExists(key) {
  const dirPath = join(PATHS.ASSETS_DIR, key);
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (_error) {
    return false;
  }
}

/**
 * 读取图片的 meta 信息
 * @param {string} key - 图片 key
 * @returns {Promise<Object|null>} - meta 信息或 null（文件不存在）
 */
async function readImageMeta(key) {
  const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");

  try {
    await access(metaPath, constants.F_OK | constants.R_OK);
    const content = await readFile(metaPath, "utf8");
    return yamlParse(content);
  } catch (_error) {
    return null;
  }
}

/**
 * 检查图片文件是否存在
 * @param {string} key - 图片 key
 * @param {string} locale - 语言代码
 * @returns {Promise<string|null>} - 图片路径或 null（不存在）
 */
async function getExistingImagePath(key, locale) {
  const imagePath = join(PATHS.ASSETS_DIR, key, "images", `${locale}.png`);

  try {
    await access(imagePath, constants.F_OK | constants.R_OK);
    return imagePath;
  } catch (_error) {
    return null;
  }
}

/**
 * 判断文档 hash 是否发生变化
 * @param {Array} currentDocs - 当前文档列表
 * @param {Array} metaDocs - meta 中记录的文档列表
 * @returns {boolean} - 是否有变化
 */
function hasDocumentChanges(currentDocs, metaDocs) {
  if (!metaDocs || metaDocs.length === 0) {
    return true;
  }

  // 将 meta 文档转换为 map（path -> hash）
  const metaHashMap = new Map(metaDocs.map((doc) => [doc.path, doc.hash]));

  // 检查每个当前文档的 hash
  for (const doc of currentDocs) {
    const metaHash = metaHashMap.get(doc.path);
    if (!metaHash || metaHash !== doc.hash) {
      return true; // hash 不同或新文档
    }
  }

  return false;
}

/**
 * 准备生图任务
 * @param {Object} input - 输入参数
 * @param {string} input.locale - 主语言
 * @param {Array} input.slots - 扫描到的 slot 列表
 * @param {boolean} input.force - 是否强制重新生成
 * @returns {Promise<Object>} - 任务列表
 */
export default async function prepareGeneration(input) {
  try {
    const { locale, slots, force = false } = input;

    if (!locale) {
      throw new Error("缺少主语言参数， 请检查 doc-smith 工作目录是否已初始化，且文件已生成！");
    }

    if (!slots || slots.length === 0) {
      return {
        success: true,
        locale,
        generationTasks: [],
        message: "没有找到需要生成的图片 slot",
      };
    }

    const generationTasks = [];
    let skippedCount = 0;

    // 检查每个 slot
    for (const slot of slots) {
      const { key, id, desc, documents } = slot;

      // 检查图片目录是否存在
      const dirExists = await imageDirectoryExists(key);

      let needsGeneration = false;
      let isUpdate = false;
      let existingImagePath = null;

      if (force) {
        // 强制重新生成
        needsGeneration = true;
        isUpdate = dirExists;
        if (isUpdate) {
          existingImagePath = await getExistingImagePath(key, locale);
        }
      } else if (!dirExists) {
        // 图片目录不存在，需要生成
        needsGeneration = true;
        isUpdate = false;
      } else {
        // 图片目录存在，检查 hash 是否变化
        const meta = await readImageMeta(key);

        if (!meta) {
          // meta 文件不存在，重新生成
          needsGeneration = true;
          isUpdate = false;
        } else {
          const hasChanges = hasDocumentChanges(documents, meta.documents);

          if (hasChanges) {
            // 文档有变化，更新图片
            needsGeneration = true;
            isUpdate = true;
            existingImagePath = await getExistingImagePath(key, locale);
          } else {
            // 没有变化，跳过
            needsGeneration = false;
            skippedCount++;
          }
        }
      }

      if (needsGeneration) {
        generationTasks.push({
          key,
          id,
          desc,
          documents,
          isUpdate,
          existingImagePath,
        });
      }
    }

    return {
      success: true,
      locale,
      generationTasks,
      totalSlots: slots.length,
      newTasks: generationTasks.filter((t) => !t.isUpdate).length,
      updateTasks: generationTasks.filter((t) => t.isUpdate).length,
      skippedTasks: skippedCount,
      message: `准备生成 ${generationTasks.length} 个图片（新增 ${generationTasks.filter((t) => !t.isUpdate).length}，更新 ${generationTasks.filter((t) => t.isUpdate).length}，跳过 ${skippedCount}）`,
    };
  } catch (error) {
    throw new Error(`准备生图任务时发生错误: ${error.message}`);
  }
}

// 添加描述信息
prepareGeneration.description =
  "检查已有图片目录和 meta 信息，对比文档 hash，" + "判断哪些图片需要生成或更新，生成任务列表。";

// 定义输入 schema
prepareGeneration.input_schema = {
  type: "object",
  properties: {
    locale: {
      type: "string",
      description: "主语言代码",
    },
    slots: {
      type: "array",
      description: "扫描到的 slot 列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          id: { type: "string" },
          desc: { type: "string" },
          documents: {
            type: "array",
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
    force: {
      type: "boolean",
      description: "是否强制重新生成所有图片",
      default: false,
    },
  },
  required: ["locale", "slots"],
};

// 定义输出 schema
prepareGeneration.output_schema = {
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
    generationTasks: {
      type: "array",
      description: "需要生成的任务列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          id: { type: "string" },
          desc: { type: "string" },
          documents: { type: "array" },
          isUpdate: { type: "boolean" },
          existingImagePath: { type: "string", nullable: true },
        },
      },
    },
    totalSlots: {
      type: "number",
      description: "总 slot 数量",
    },
    newTasks: {
      type: "number",
      description: "新增任务数量",
    },
    updateTasks: {
      type: "number",
      description: "更新任务数量",
    },
    skippedTasks: {
      type: "number",
      description: "跳过的任务数量",
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
