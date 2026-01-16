import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import path from "node:path";
import {
  PATHS,
  ERROR_CODES,
  FILE_TYPES,
  DOC_META_DEFAULTS,
} from "../../../utils/agent-constants.mjs";

/**
 * 保存翻译结果并更新 .meta.yaml
 * @param {Object} input - 输入参数
 * @param {string} input.path - 文档路径
 * @param {string} input.targetFile - 目标文件路径
 * @param {string} input.targetLanguage - 目标语言代码
 * @param {string} input.sourceHash - 源文档的 hash
 * @param {string} input.translation - 翻译内容
 * @returns {Promise<Object>} - 操作结果
 */
export default async function saveTranslation(input) {
  const { path: docPath, targetFile, targetLanguage, sourceHash, translation } = input;
  try {
    // 1. 保存翻译文件
    await writeFile(targetFile, translation, "utf8");

    // 2. 更新 .meta.yaml
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const metaPath = path.join(docFolder, FILE_TYPES.META);

    let meta = {};
    let metaExists = false;

    // 尝试读取现有的 .meta.yaml
    try {
      await access(metaPath, constants.F_OK | constants.R_OK);
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
      metaExists = true;
    } catch (_error) {
      // .meta.yaml 不存在，使用默认值
      meta = {
        kind: DOC_META_DEFAULTS.KIND,
        source: targetLanguage,
        default: targetLanguage,
      };
    }

    // 3. 初始化或更新 languages 数组
    if (!meta.languages || !Array.isArray(meta.languages)) {
      // 初始化 languages 数组，包含源语言
      meta.languages = meta.source ? [meta.source] : [];
    }

    // 4. 添加目标语言（避免重复）
    if (!meta.languages.includes(targetLanguage)) {
      meta.languages.push(targetLanguage);
    }

    // 5. 初始化或更新 translations 对象
    if (!meta.translations || typeof meta.translations !== "object") {
      meta.translations = {};
    }

    // 6. 记录翻译信息（sourceHash 和翻译时间）
    meta.translations[targetLanguage] = {
      sourceHash,
      translatedAt: new Date().toISOString(),
    };

    // 7. 保存更新后的 .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      targetFile,
      targetLanguage,
      metaUpdated: true,
      languages: meta.languages,
      message: metaExists
        ? `翻译已保存并更新元信息: ${targetFile}`
        : `翻译已保存并创建元信息: ${targetFile}`,
      path: docPath,
    };
  } catch (error) {
    return {
      path: docPath,
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `保存翻译时发生错误: ${error.message}`,
      suggestion: "请检查文件系统权限",
    };
  }
}

// 添加描述信息
saveTranslation.description =
  "保存翻译结果到目标文件，并更新文档的 .meta.yaml 文件。" +
  "自动将目标语言添加到 languages 数组中，" +
  "记录源文档的 hash 和翻译时间到 translations 对象，用于后续判断是否需要重新翻译。";

// 定义输入 schema
saveTranslation.input_schema = {
  type: "object",
  required: ["path", "targetFile", "targetLanguage", "sourceHash", "translation"],
  properties: {
    path: {
      type: "string",
      description: "文档路径",
    },
    targetFile: {
      type: "string",
      description: "目标文件路径",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    sourceHash: {
      type: "string",
      description: "源文档的 SHA256 hash",
    },
    translation: {
      type: "string",
      description: "翻译内容",
    },
  },
};

// 定义输出 schema
saveTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    targetFile: {
      type: "string",
      description: "目标文件路径（成功时存在）",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码（成功时存在）",
    },
    metaUpdated: {
      type: "boolean",
      description: "元信息是否已更新（成功时存在）",
    },
    languages: {
      type: "array",
      items: { type: "string" },
      description: "更新后的语言列表（成功时存在）",
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
