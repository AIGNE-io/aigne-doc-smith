import { writeFile, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { stringify as yamlStringify } from "yaml";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { getExtensionFromMimeType } from "../../utils/image-utils.mjs";

/**
 * 保存图片文件
 * @param {string} key - 图片 key
 * @param {string} locale - 语言代码
 * @param {Object} imageInfo - 图片信息 { path, mimeType, ... }
 * @returns {Promise<string>} - 保存的图片路径
 */
async function saveImage(key, locale, imageInfo) {
  const ext = getExtensionFromMimeType(imageInfo.mimeType);
  const imagePath = join(PATHS.ASSETS_DIR, key, "images", `${locale}.${ext}`);

  // 确保目录存在
  await mkdir(dirname(imagePath), { recursive: true });

  // 从临时文件复制到目标位置
  await copyFile(imageInfo.path, imagePath);

  return imagePath;
}

/**
 * 生成或更新 .meta.yaml
 * @param {string} key - 图片 key
 * @param {string} id - slot id
 * @param {string} desc - slot 描述
 * @param {Array} documents - 关联文档列表
 * @param {string} locale - 主语言
 * @param {string} model - 使用的模型
 * @returns {Promise<void>}
 */
async function saveMeta(key, id, desc, documents, locale, model) {
  const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");

  const meta = {
    kind: "image",
    slot: {
      id,
      key,
      desc,
    },
    generation: {
      model,
      createdAt: new Date().toISOString(),
      shared: false, // 默认 false，翻译时由 LLM 判断
    },
    documents: documents.map((doc) => ({
      path: doc.path,
      hash: doc.hash,
    })),
    languages: [locale],
  };

  // 确保目录存在
  await mkdir(dirname(metaPath), { recursive: true });

  // 保存 meta
  await writeFile(metaPath, yamlStringify(meta), "utf8");
}

/**
 * 保存图片生成结果
 * @param {Object} input - 输入参数（包含生图结果）
 * @returns {Promise<Object>} - 保存结果
 */
export default async function saveImageResult(input) {
  try {
    const { key, id, desc, documents, locale, isUpdate, imageGenParams } = input;

    // 验证参数
    if (!key || !id || !desc || !documents || !locale) {
      return {
        success: false,
        key,
        error: "MISSING_PARAMETERS",
        message: "缺少必需参数",
        suggestion: "请确保传入了 key, id, desc, documents, locale",
      };
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return {
        success: false,
        key,
        error: "INVALID_DOCUMENTS",
        message: "documents 参数无效或为空",
        suggestion: "请确保至少有一个关联文档",
      };
    }

    // 从 input.images 获取生图结果
    // 格式: [{ filename, mimeType, type, path }, ...]
    const images = input.images;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        success: false,
        key,
        error: "GENERATION_FAILED",
        message: "未找到生成的图片数据",
        suggestion: "请检查生图 agent 的输出格式，期望 images 数组",
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
        suggestion: "请检查生图 agent 返回的 images 格式",
      };
    }

    const model = imageGenParams?.model;

    // 保存图片（从临时路径复制到 assets 目录）
    const imagePath = await saveImage(key, locale, imageInfo);

    // 保存或更新 meta
    await saveMeta(key, id, desc, documents, locale, model);

    return {
      success: true,
      key,
      imagePath,
      isUpdate,
      message: `成功${isUpdate ? "更新" : "生成"}图片: ${imagePath}`,
    };
  } catch (error) {
    return {
      success: false,
      key: input.key,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `保存图片时发生错误: ${error.message}`,
      suggestion: "请检查文件系统权限和生图 agent 配置",
      stack: error.stack,
    };
  }
}

// 添加描述信息
saveImageResult.description =
  "保存生图 agent 的结果到 assets 目录，" + "包括图片文件和 .meta.yaml 元信息文件。";

// 定义输入 schema
saveImageResult.input_schema = {
  type: "object",
  properties: {
    key: {
      type: "string",
      description: "图片 key（目录名）",
    },
    id: {
      type: "string",
      description: "slot id",
    },
    desc: {
      type: "string",
      description: "slot 描述",
    },
    documents: {
      type: "array",
      description: "关联文档列表",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          hash: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    locale: {
      type: "string",
      description: "主语言代码",
    },
    isUpdate: {
      type: "boolean",
      description: "是否为更新模式",
    },
    imageGenParams: {
      type: "object",
      description: "传递给生图 agent 的参数",
    },
    // 以下字段由生图 agent 返回
    images: {
      type: "array",
      description: "生图 agent 返回的图片列表",
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
  required: ["key", "id", "desc", "documents", "locale"],
};

// 定义输出 schema
saveImageResult.output_schema = {
  type: "object",
  required: ["success", "key"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    key: {
      type: "string",
      description: "图片 key",
    },
    imagePath: {
      type: "string",
      description: "生成的图片路径",
    },
    isUpdate: {
      type: "boolean",
      description: "是否为更新操作",
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
