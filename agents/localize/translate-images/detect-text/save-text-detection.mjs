import { readFile, writeFile } from "node:fs/promises";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { ERROR_CODES } from "../../../../utils/agent-constants.mjs";

/**
 * 保存文字检测结果到 .meta.yaml
 * @param {Object} input - 输入参数
 * @param {string} input.key - 图片 key
 * @param {string} input.metaPath - .meta.yaml 文件路径
 * @param {boolean} input.hasText - 是否包含文字（从 detect-image-text.yaml 输出）
 * @returns {Promise<Object>} - 操作结果
 */
export default async function saveTextDetection(input) {
  const { key, metaPath, hasText } = input;

  try {
    // 读取 .meta.yaml
    const metaContent = await readFile(metaPath, "utf8");
    const meta = yamlParse(metaContent);

    // 更新 generation.shared 字段
    if (!meta.generation) {
      meta.generation = {};
    }

    // shared = !hasText (无文字则共享)
    meta.generation.shared = !hasText;

    // 保存更新后的 .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      key,
      hasText,
      shared: !hasText,
      message: `已更新 shared 字段: ${key} (hasText=${hasText}, shared=${!hasText})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `保存文字检测结果时发生错误: ${error.message}`,
      key,
    };
  }
}

// 添加描述信息
saveTextDetection.description =
  "保存图片文字检测结果到 .meta.yaml 文件。" +
  "根据检测结果更新 generation.shared 字段：无文字图片 shared=true，有文字图片 shared=false。";

// 定义输入 schema
saveTextDetection.input_schema = {
  type: "object",
  required: ["key", "metaPath", "hasText"],
  properties: {
    key: {
      type: "string",
      description: "图片 key",
    },
    metaPath: {
      type: "string",
      description: ".meta.yaml 文件路径",
    },
    hasText: {
      type: "boolean",
      description: "图片是否包含文字（从 detect-image-text.yaml 输出）",
    },
  },
};

// 定义输出 schema
saveTextDetection.output_schema = {
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
    hasText: {
      type: "boolean",
      description: "图片是否包含文字（成功时存在）",
    },
    shared: {
      type: "boolean",
      description: "是否为共享图（成功时存在）",
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
