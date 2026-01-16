import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { ERROR_CODES } from "../../../utils/agent-constants.mjs";
import { getExtensionFromMimeType } from "../../../utils/image-utils.mjs";

/**
 * 保存翻译后的图片并更新 .meta.yaml
 * @param {Object} input - 输入参数
 * @param {string} input.key - 图片 key
 * @param {string} input.assetDir - 图片资源目录
 * @param {string} input.targetLanguage - 目标语言
 * @param {string} input.sourceHash - 源图片 hash
 * @param {Array} input.images - 图片翻译结果（来自 translate-image.yaml）
 * @returns {Promise<Object>} - 操作结果
 */
export default async function saveImageTranslation(input) {
  const { key, assetDir, targetLanguage, sourceHash, images } = input;

  try {
    // 1. 验证图片数据
    // 格式: [{ filename, mimeType, type, path }, ...]
    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        success: false,
        key,
        error: "GENERATION_FAILED",
        message: "未找到翻译后的图片数据",
        suggestion: "请检查图片翻译 agent 的输出格式，期望 images 数组",
        availableKeys: Object.keys(input),
      };
    }

    // 使用第一张图片
    const imageInfo = images[0];
    if (!imageInfo.path) {
      return {
        success: false,
        key,
        error: "INVALID_IMAGE_DATA",
        message: "图片数据缺少 path 字段",
        suggestion: "请检查图片翻译 agent 返回的 images 格式",
      };
    }

    // 2. 确定目标文件路径
    const ext = getExtensionFromMimeType(imageInfo.mimeType);
    const targetImagePath = join(assetDir, "images", `${targetLanguage}.${ext}`);

    // 确保目录存在
    await mkdir(dirname(targetImagePath), { recursive: true });

    // 3. 从临时文件复制到目标位置
    await copyFile(imageInfo.path, targetImagePath);

    // 4. 更新 .meta.yaml
    const metaPath = join(assetDir, ".meta.yaml");
    const metaContent = await readFile(metaPath, "utf8");
    const meta = yamlParse(metaContent);

    // 4.1 添加目标语言到 languages 数组
    if (!meta.languages || !Array.isArray(meta.languages)) {
      meta.languages = [];
    }
    if (!meta.languages.includes(targetLanguage)) {
      meta.languages.push(targetLanguage);
    }

    // 4.2 更新 translations 信息
    if (!meta.translations) {
      meta.translations = {};
    }
    meta.translations[targetLanguage] = {
      sourceHash,
      translatedAt: new Date().toISOString(),
    };

    // 5. 保存更新后的 .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      key,
      targetLanguage,
      targetImagePath,
      message: `图片翻译已保存: ${targetImagePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `保存图片翻译时发生错误: ${error.message}`,
      key,
    };
  }
}

// 添加描述信息
saveImageTranslation.description =
  "保存翻译后的图片到目标路径，并更新 .meta.yaml 文件。" +
  "记录源图片 hash 和翻译时间，用于后续判断是否需要重新翻译。";

// 定义输入 schema
saveImageTranslation.input_schema = {
  type: "object",
  required: ["key", "assetDir", "targetLanguage", "sourceHash", "images"],
  properties: {
    key: {
      type: "string",
      description: "图片 key",
    },
    assetDir: {
      type: "string",
      description: "图片资源目录路径",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    sourceHash: {
      type: "string",
      description: "源图片的 hash",
    },
    images: {
      type: "array",
      description: "图片翻译 agent 返回的图片列表",
      items: {
        type: "object",
        properties: {
          filename: { type: "string", description: "文件名" },
          mimeType: { type: "string", description: "MIME 类型" },
          type: { type: "string", description: "类型（local）" },
          path: { type: "string", description: "临时文件路径" },
        },
      },
    },
  },
};

// 定义输出 schema
saveImageTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    key: {
      type: "string",
      description: "图片 key",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码（成功时存在）",
    },
    targetImagePath: {
      type: "string",
      description: "保存的图片路径（成功时存在）",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
    error: {
      type: "string",
      description: "错误代码（失败时存在）",
    },
  },
};
