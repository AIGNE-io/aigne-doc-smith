import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { calculateFileHash, findImageFile } from "../../../utils/image-utils.mjs";

/**
 * 检查图片是否需要翻译
 * @param {Object} input - 输入参数
 * @param {Array} input.slots - 图片 slot 列表（从 scan-doc-images 输出）
 * @param {string} input.targetLanguage - 目标语言
 * @param {string} input.sourceLanguage - 源语言（主语言）
 * @returns {Promise<Object>} - 检查结果
 */
export default async function checkImageTranslation(input) {
  const { slots, targetLanguage, sourceLanguage } = input;

  if (!slots || slots.length === 0) {
    return {
      success: true,
      translationTasks: [],
      message: "没有需要检查的图片",
    };
  }

  const translationTasks = [];
  let sharedCount = 0;
  let alreadyTranslatedCount = 0;
  let needUpdateCount = 0;

  for (const slot of slots) {
    const { key, desc, assetDir, metaPath, exists } = slot;

    // 如果图片资源不存在，跳过
    if (!exists) {
      continue;
    }

    // 读取 .meta.yaml
    let meta;
    try {
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
    } catch (_error) {
      // .meta.yaml 读取失败，跳过
      continue;
    }

    // 1. 检查是否为无文字共享图
    if (meta.generation?.shared === true) {
      sharedCount++;
      continue; // 跳过无文字图片
    }

    // 2. 检查目标语言是否已存在
    const languages = meta.languages || [];
    const alreadyTranslated = languages.includes(targetLanguage);

    // 3. 查找源语言图片
    const imagesDir = join(assetDir, "images");
    const sourceImagePath = await findImageFile(imagesDir, sourceLanguage);
    if (!sourceImagePath) {
      // 源图片不存在，跳过
      continue;
    }

    // 4. 计算源图片 hash
    const sourceHash = await calculateFileHash(sourceImagePath);

    // 5. 判断是否需要翻译
    let needsTranslation = false;
    let reason = "";

    if (!alreadyTranslated) {
      // 目标语言版本不存在，需要翻译
      needsTranslation = true;
      reason = "missing";
    } else {
      // 已翻译，检查源图片是否更新
      const translations = meta.translations || {};
      const translationInfo = translations[targetLanguage];

      if (!translationInfo || !translationInfo.sourceHash) {
        // 没有记录源 hash，需要重新翻译
        needsTranslation = true;
        reason = "no_hash";
      } else if (translationInfo.sourceHash !== sourceHash) {
        // 源图片已更新，需要重新翻译
        needsTranslation = true;
        reason = "source_updated";
        needUpdateCount++;
      } else {
        // 已翻译且源图片未变化，跳过
        alreadyTranslatedCount++;
      }
    }

    if (needsTranslation) {
      // 获取图片的宽高比（从 meta 或默认）
      const aspectRatio = meta.generation?.aspectRatio || "4:3";
      const size = meta.generation?.size || "2K";

      translationTasks.push({
        key,
        desc,
        assetDir,
        sourceImagePath,
        sourceHash,
        aspectRatio,
        size,
        reason,
      });
    }
  }

  return {
    success: true,
    translationTasks,
    sourceLanguage,
    targetLanguage,
    stats: {
      total: slots.length,
      shared: sharedCount,
      alreadyTranslated: alreadyTranslatedCount,
      needUpdate: needUpdateCount,
      needTranslation: translationTasks.length,
    },
    message:
      `检查了 ${slots.length} 个图片: ` +
      `${sharedCount} 个无文字共享图, ` +
      `${alreadyTranslatedCount} 个已翻译, ` +
      `${translationTasks.length} 个需要翻译` +
      (needUpdateCount > 0 ? ` (其中 ${needUpdateCount} 个需要更新)` : ""),
  };
}

// 添加描述信息
checkImageTranslation.description =
  "检查图片是否需要翻译成目标语言。" +
  "跳过无文字共享图，检查源图片 hash 以判断是否需要重新翻译。" +
  "返回需要翻译的图片任务列表。";

// 定义输入 schema
checkImageTranslation.input_schema = {
  type: "object",
  required: ["slots", "targetLanguage", "sourceLanguage"],
  properties: {
    slots: {
      type: "array",
      description: "图片 slot 列表（从 scan-doc-images 输出）",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          desc: { type: "string" },
          assetDir: { type: "string", nullable: true },
          metaPath: { type: "string", nullable: true },
          exists: { type: "boolean" },
        },
      },
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码（主语言）",
    },
  },
};

// 定义输出 schema
checkImageTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    translationTasks: {
      type: "array",
      description: "需要翻译的图片任务列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "图片 key" },
          desc: { type: "string", description: "图片描述" },
          assetDir: { type: "string", description: "图片资源目录" },
          sourceImagePath: { type: "string", description: "源图片文件路径" },
          sourceHash: { type: "string", description: "源图片 hash" },
          aspectRatio: { type: "string", description: "宽高比" },
          size: { type: "string", description: "图片尺寸" },
          reason: { type: "string", description: "翻译原因 (missing/no_hash/source_updated)" },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    stats: {
      type: "object",
      description: "统计信息",
      properties: {
        total: { type: "number", description: "总图片数" },
        shared: { type: "number", description: "无文字共享图数量" },
        alreadyTranslated: { type: "number", description: "已翻译数量" },
        needUpdate: { type: "number", description: "需要更新数量" },
        needTranslation: { type: "number", description: "需要翻译数量" },
      },
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
  },
};
