import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { parse as yamlParse } from "yaml";
import { findImageFile, getImageMimeType } from "../../../../utils/image-utils.mjs";

/**
 * 检测图片是否包含文字并更新 .meta.yaml 的 shared 字段
 * @param {Object} input - 输入参数
 * @param {Array} input.slots - 图片 slot 列表（从 scan-doc-images 输出）
 * @param {string} input.sourceLanguage - 源语言（主语言）
 * @returns {Promise<Object>} - 处理结果
 */
export default async function detectAndUpdateShared(input) {
  const { slots, sourceLanguage } = input;

  if (!slots || slots.length === 0 || !slots.some((s) => s.exists)) {
    return {
      success: true,
      detectionTasks: [],
      message: "没有需要检测的图片",
    };
  }

  const detectionTasks = [];

  for (const slot of slots) {
    const { key, assetDir, metaPath, exists } = slot;

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

    // 检查是否已经检测过 shared 字段
    if (meta.generation?.shared === true) {
      // 已经检测过，跳过共享图
      continue;
    }

    // 查找主语言图片
    const imagesDir = join(assetDir, "images");
    const sourceImagePath = await findImageFile(imagesDir, sourceLanguage);

    if (!sourceImagePath) {
      // 主语言图片不存在，跳过
      continue;
    }

    // 添加到检测任务列表
    detectionTasks.push({
      key,
      assetDir,
      metaPath,
      sourceImagePath,
      // 准备 imageFile 参数（mediaFile 格式）
      imageFile: [
        {
          type: "local",
          path: sourceImagePath,
          filename: basename(sourceImagePath),
          mimeType: getImageMimeType(sourceImagePath),
        },
      ],
    });
  }

  return {
    success: true,
    detectionTasks,
    sourceLanguage,
    message: `需要检测 ${detectionTasks.length} 个图片是否包含文字`,
  };
}

// 添加描述信息
detectAndUpdateShared.description =
  "检测图片是否包含文字，准备批量检测任务。" + "只检测尚未设置 generation.shared 字段的图片。";

// 定义输入 schema
detectAndUpdateShared.input_schema = {
  type: "object",
  required: ["slots", "sourceLanguage"],
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
    sourceLanguage: {
      type: "string",
      description: "源语言代码（主语言）",
    },
  },
};

// 定义输出 schema
detectAndUpdateShared.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    detectionTasks: {
      type: "array",
      description: "需要检测的图片任务列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "图片 key" },
          assetDir: { type: "string", description: "图片资源目录" },
          metaPath: { type: "string", description: ".meta.yaml 文件路径" },
          sourceImagePath: { type: "string", description: "主语言图片路径" },
          imageFile: { type: "array", description: "imageFile mediaFile 对象数组" },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
  },
};
