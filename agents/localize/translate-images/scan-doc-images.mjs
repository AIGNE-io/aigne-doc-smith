import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { parseSlots } from "../../../utils/image-slots.mjs";
import { PATHS, ERROR_CODES } from "../../../utils/agent-constants.mjs";

/**
 * 扫描文档中的图片 slots
 * @param {Object} input - 输入参数
 * @param {string} input.path - 文档路径
 * @param {string} input.sourceLanguage - 源语言代码
 * @param {string} input.language - 目标语言
 * @returns {Promise<Object>} - 扫描结果
 */
export default async function scanDocImages(input) {
  const { path: docPath, sourceLanguage, language } = input;
  const targetLanguage = language;

  try {
    // 1. 构建源文档文件路径
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const sourceFile = path.join(docFolder, `${sourceLanguage}.md`);

    // 2. 读取源文档内容
    let content;
    try {
      await access(sourceFile, constants.F_OK | constants.R_OK);
      content = await readFile(sourceFile, "utf-8");
    } catch (_error) {
      throw new Error(`源文档不存在: ${sourceFile}, 文档路径: ${docPath}`);
    }

    // 3. 解析文档中的 slots
    const slots = parseSlots(content, docPath);

    if (slots.length === 0) {
      return {
        success: true,
        hasSlots: false,
        slots: [],
        targetLanguage,
        path: docPath,
        message: `文档中没有图片 slot`,
      };
    }

    // 4. 检查每个 slot 的源图片信息
    const slotsWithInfo = [];
    for (const slot of slots) {
      const { key, desc } = slot;

      // 检查图片目录是否存在
      const assetDir = path.join(PATHS.ASSETS_DIR, key);
      const metaPath = path.join(assetDir, ".meta.yaml");

      try {
        await access(metaPath, constants.F_OK | constants.R_OK);

        slotsWithInfo.push({
          key,
          desc,
          assetDir,
          metaPath,
          exists: true,
        });
      } catch (_error) {
        // 图片资源不存在，跳过
        slotsWithInfo.push({
          key,
          desc,
          assetDir: null,
          metaPath: null,
          exists: false,
        });
      }
    }

    return {
      success: true,
      hasSlots: true,
      slots: slotsWithInfo,
      targetLanguage,
      path: docPath,
      message: `文档中找到 ${slots.length} 个图片 slot，其中 ${slotsWithInfo.filter((s) => s.exists).length} 个存在源图片`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `扫描文档图片时发生错误: ${error.message}`,
      path: docPath,
    };
  }
}

// 添加描述信息
scanDocImages.description =
  "扫描主语言文档内容，提取其中的 AFS image slot，并检查对应的图片资源是否存在。" +
  "返回需要检查翻译状态的图片列表。";

// 定义输入 schema
scanDocImages.input_schema = {
  type: "object",
  required: ["path", "sourceLanguage", "language"],
  properties: {
    path: {
      type: "string",
      description: "文档路径",
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码",
    },
    language: {
      type: "string",
      description: "目标语言代码",
    },
  },
};

// 定义输出 schema
scanDocImages.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    hasSlots: {
      type: "boolean",
      description: "文档中是否包含图片 slot",
    },
    slots: {
      type: "array",
      description: "图片 slot 列表",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "图片 key" },
          desc: { type: "string", description: "图片描述" },
          assetDir: { type: "string", description: "图片资源目录路径", nullable: true },
          metaPath: { type: "string", description: ".meta.yaml 文件路径", nullable: true },
          exists: { type: "boolean", description: "图片资源是否存在" },
        },
      },
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    path: {
      type: "string",
      description: "文档路径",
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
