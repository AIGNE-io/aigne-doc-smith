import { basename } from "node:path";
import { ERROR_CODES } from "../../../utils/agent-constants.mjs";

/**
 * 准备图片翻译的输入参数
 * @param {Object} input - 输入参数（来自 translationTasks 的单个任务）
 * @param {string} input.key - 图片 key
 * @param {string} input.desc - 图片描述
 * @param {string} input.assetDir - 图片资源目录
 * @param {string} input.sourceImagePath - 源图片路径
 * @param {string} input.sourceHash - 源图片 hash
 * @param {string} input.aspectRatio - 宽高比
 * @param {string} input.size - 图片尺寸
 * @param {string} input.sourceLanguage - 源语言（来自父级）
 * @param {string} input.targetLanguage - 目标语言（来自父级）
 * @returns {Promise<Object>} - 准备好的输入参数
 */
export default async function prepareImageInput(input) {
  const {
    key,
    desc,
    assetDir,
    sourceImagePath,
    sourceHash,
    aspectRatio,
    size,
    sourceLanguage,
    targetLanguage,
  } = input;

  try {
    // 准备 existingImage 参数（mediaFile 格式）
    const existingImage = [
      {
        type: "local",
        path: sourceImagePath,
        filename: basename(sourceImagePath),
        mimeType: sourceImagePath.endsWith(".png") ? "image/png" : "image/jpeg",
      },
    ];

    return {
      success: true,
      // 传递给 translate-image.yaml 的参数
      existingImage,
      desc,
      sourceLanguage,
      targetLocale: targetLanguage,
      ratio: aspectRatio,
      size,
      // 传递给 save-image-translation.mjs 的参数
      key,
      assetDir,
      targetLanguage,
      sourceHash,
      message: `准备翻译图片: ${key} (${sourceLanguage} → ${targetLanguage})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `准备图片翻译输入时发生错误: ${error.message}`,
      key,
    };
  }
}

// 添加描述信息
prepareImageInput.description =
  "准备图片翻译的输入参数，将翻译任务转换为 translate-image.yaml 所需的格式。" +
  "构建 sourceImage mediaFile 对象数组，传递必要的参数。";

// 定义输入 schema
prepareImageInput.input_schema = {
  type: "object",
  required: [
    "key",
    "desc",
    "assetDir",
    "sourceImagePath",
    "sourceHash",
    "aspectRatio",
    "size",
    "sourceLanguage",
    "targetLanguage",
  ],
  properties: {
    key: { type: "string", description: "图片 key" },
    desc: { type: "string", description: "图片描述" },
    assetDir: { type: "string", description: "图片资源目录" },
    sourceImagePath: { type: "string", description: "源图片路径" },
    sourceHash: { type: "string", description: "源图片 hash" },
    aspectRatio: { type: "string", description: "宽高比" },
    size: { type: "string", description: "图片尺寸" },
    sourceLanguage: { type: "string", description: "源语言代码" },
    targetLanguage: { type: "string", description: "目标语言代码" },
    reason: { type: "string", description: "翻译原因" },
  },
};

// 定义输出 schema
prepareImageInput.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: { type: "boolean", description: "操作是否成功" },
    existingImage: {
      type: "array",
      description: "源图片 mediaFile 对象数组",
      items: { type: "object" },
    },
    desc: { type: "string", description: "图片描述" },
    sourceLanguage: { type: "string", description: "源语言代码" },
    targetLocale: { type: "string", description: "目标语言代码" },
    ratio: { type: "string", description: "宽高比" },
    size: { type: "string", description: "图片尺寸" },
    key: { type: "string", description: "图片 key" },
    assetDir: { type: "string", description: "图片资源目录" },
    targetLanguage: { type: "string", description: "目标语言代码" },
    sourceHash: { type: "string", description: "源图片 hash" },
    message: { type: "string", description: "操作结果描述" },
    error: { type: "string", description: "错误代码（失败时存在）" },
  },
};
