import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS, ERROR_CODES, FILE_TYPES } from "../../../utils/agent-constants.mjs";
import { calculateContentHash } from "../../../utils/image-utils.mjs";
import saveTranslation from "./save-translation.mjs";

/**
 * 翻译单个文档到单个目标语言
 * @param {Object} input - 输入参数
 * @param {string} input.path - 文档路径
 * @param {string} input.sourceLanguage - 源语言代码
 * @param {string} input.language - 当前迭代的目标语言代码（来自 iterate_on）
 * @param {boolean} input.force - 是否强制重新翻译
 * @param {string} input.glossary - 术语表内容
 * @param {Object} options - 选项参数
 * @param {Object} options.context - 上下文对象，包含 invoke 方法
 * @returns {Promise<Object>} - 翻译结果
 */
export default async function translateDocumentToLanguage(input, options) {
  try {
    const { path: docPath, sourceLanguage, language, force = false, glossary = "" } = input;

    // 当使用 iterate_on 时，对象属性会被展开，直接接收 language 字段
    const targetLanguage = language;

    // 1. 构建文件路径
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const sourceFile = path.join(docFolder, `${sourceLanguage}.md`);
    const targetFile = path.join(docFolder, `${targetLanguage}.md`);

    // 2. 读取源文档
    let content;
    try {
      await access(sourceFile, constants.F_OK | constants.R_OK);
      content = await readFile(sourceFile, "utf8");
    } catch (_error) {
      throw new Error(`源文档不存在: ${sourceFile}, 文档路径: ${docPath}, 请确保源语言文档已创建`);
    }

    // 3. 计算源文档 hash
    const sourceHash = calculateContentHash(content);

    // 4. 检查是否需要翻译（除非强制翻译）
    if (!force) {
      const metaPath = path.join(docFolder, FILE_TYPES.META);
      try {
        await access(metaPath, constants.F_OK | constants.R_OK);
        const metaContent = await readFile(metaPath, "utf8");
        const meta = yamlParse(metaContent);

        // 检查是否已有该语言的翻译记录
        if (meta.translations?.[targetLanguage]) {
          const translationInfo = meta.translations[targetLanguage];

          // 如果 hash 相同，跳过翻译
          if (translationInfo.sourceHash === sourceHash) {
            return {
              success: true,
              skipped: true,
              reason: "hash_unchanged",
              targetLanguage,
              message: `源文档未变化，跳过翻译: ${docPath} (${sourceLanguage} -> ${targetLanguage})`,
              path: docPath,
            };
          }
        }
      } catch (_error) {
        // .meta.yaml 不存在或读取失败，继续翻译
      }
    }

    // 5. 尝试读取旧翻译（作为参考）
    let previousTranslation = "";
    try {
      await access(targetFile, constants.F_OK | constants.R_OK);
      previousTranslation = await readFile(targetFile, "utf8");
    } catch (_error) {
      // 旧翻译不存在，这是正常的
    }

    // 6. 调用翻译 agent
    const translateDocumentAgent = options.context?.agents?.["translateDocument"];
    const translateResult = await options.context.invoke(translateDocumentAgent, {
      language: targetLanguage,
      content,
      glossary,
      previousTranslation,
    });

    if (!translateResult || !translateResult.translation) {
      throw new Error(
        `翻译失败: ${docPath} (${sourceLanguage} -> ${targetLanguage}), 请尝试重新翻译`,
      );
    }

    // 7. 保存翻译结果
    const saveResult = await saveTranslation({
      path: docPath,
      targetFile,
      targetLanguage,
      sourceHash,
      translation: translateResult.translation,
    });

    return {
      ...saveResult,
      path: docPath,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `翻译过程中发生错误: ${error.message}`,
      suggestion: "请检查文件系统权限和翻译配置",
    };
  }
}

// 添加描述信息
translateDocumentToLanguage.description =
  "翻译单个文档到单个目标语言。" +
  "计算源文档 hash，检查是否需要重新翻译（通过比较 .meta.yaml 中保存的 sourceHash）。" +
  "如果源文档未变化且非强制模式，跳过翻译。" +
  "否则调用翻译 agent 执行翻译，并保存结果和 sourceHash。";

// 定义输入 schema
translateDocumentToLanguage.input_schema = {
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
      description: "目标语言代码（来自 iterate_on，对象属性已展开）",
    },
    force: {
      type: "boolean",
      description: "是否强制重新翻译（可选，默认 false）",
    },
    glossary: {
      type: "string",
      description: "术语表内容（可选）",
    },
  },
};

// 定义输出 schema
translateDocumentToLanguage.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    skipped: {
      type: "boolean",
      description: "是否跳过了翻译（当源文档 hash 未变化时）",
    },
    reason: {
      type: "string",
      description: "跳过原因（skipped=true 时存在）",
    },
    targetFile: {
      type: "string",
      description: "目标文件路径（成功且未跳过时存在）",
    },
    targetLanguage: {
      type: "string",
      description: "目标语言代码",
    },
    metaUpdated: {
      type: "boolean",
      description: "元信息是否已更新（成功且未跳过时存在）",
    },
    languages: {
      type: "array",
      items: { type: "string" },
      description: "更新后的语言列表（成功且未跳过时存在）",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
    path: {
      type: "string",
      description: "文档路径",
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
