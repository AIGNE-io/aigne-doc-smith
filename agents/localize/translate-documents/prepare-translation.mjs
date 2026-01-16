import { loadDocumentPaths, filterValidPaths } from "../../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../../utils/agent-constants.mjs";
import { loadLocale, loadConfigFromFile, saveValueToConfig } from "../../../utils/config.mjs";

/**
 * 准备翻译任务
 * @param {Object} input - 输入参数
 * @param {string[]} input.docs - 要翻译的文档路径列表（可选）
 * @param {string[]} input.langs - 目标语言列表（必需）
 * @param {boolean} input.force - 是否强制重新翻译（可选，默认 false）
 * @returns {Promise<Object>} - 翻译任务列表或错误信息
 */
export default async function prepareTranslation(input) {
  try {
    // 1. 验证 langs 参数
    const { docs, langs, force = false } = input;

    if (!langs || !Array.isArray(langs) || langs.length === 0) {
      return {
        success: false,
        error: ERROR_CODES.MISSING_LANGS,
        message: "目标语言列表不能为空",
        suggestion: '请提供至少一个目标语言（如 ["en", "ja"]）',
      };
    }

    // 2. 读取源语言
    let sourceLanguage;
    try {
      sourceLanguage = await loadLocale();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_CONFIG_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_CONFIG_FILE,
          message: `配置文件不存在: ${PATHS.CONFIG}`,
          suggestion: "请确保在文档项目根目录执行此命令",
        };
      }
      if (error.message === ERROR_CODES.MISSING_LOCALE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_LOCALE,
          message: `${PATHS.CONFIG} 中缺少 locale 字段`,
          suggestion: `请在 ${PATHS.CONFIG} 中添加 locale 字段`,
        };
      }
      throw error;
    }

    // 3. 过滤掉与源语言相同的语言
    const targetLanguages = langs.filter((lang) => lang !== sourceLanguage);

    if (targetLanguages.length === 0) {
      return {
        success: true,
        skipped: true,
        translationTasks: [],
        sourceLanguage,
        message: `所有目标语言都与源语言 (${sourceLanguage}) 相同，跳过翻译`,
      };
    }

    // 4. 加载文档结构
    let validPaths;
    try {
      validPaths = await loadDocumentPaths();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_STRUCTURE_FILE,
          message: `文档结构文件不存在: ${PATHS.DOCUMENT_STRUCTURE}`,
          suggestion: "请先生成文档结构文件",
        };
      }
      if (error.message === ERROR_CODES.INVALID_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_STRUCTURE_FILE,
          message: "文档结构文件格式无效",
          suggestion: `请确保 ${PATHS.DOCUMENT_STRUCTURE} 包含有效的 documents 数组`,
        };
      }
      throw error;
    }

    // 5. 收集或验证文档路径
    let docPaths;
    if (!docs || docs.length === 0) {
      // 翻译所有文档
      docPaths = Array.from(validPaths);
    } else {
      // 验证指定的文档路径
      const { validPaths: validDocPaths, invalidPaths } = filterValidPaths(docs, validPaths);

      if (invalidPaths.length > 0) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_DOC_PATHS,
          message: `以下文档路径不存在于文档结构中: ${invalidPaths.join(", ")}`,
          suggestion: `请检查文档路径是否正确，或在 ${PATHS.DOCUMENT_STRUCTURE} 中添加这些路径`,
          invalidPaths,
        };
      }

      docPaths = validDocPaths;
    }

    // 6. 更新 config.yaml 中的 translateLanguages（只处理新增）
    try {
      const config = await loadConfigFromFile();
      const existingLanguages = config?.translateLanguages || [];

      // 找出新增的语言（在 targetLanguages 中但不在 existingLanguages 中）
      const newLanguages = targetLanguages.filter((lang) => !existingLanguages.includes(lang));

      // 如果有新语言，更新配置
      if (newLanguages.length > 0) {
        const updatedLanguages = [...existingLanguages, ...newLanguages];
        await saveValueToConfig(
          "translateLanguages",
          updatedLanguages,
          "A list of languages to translate the documentation to",
        );
      }
    } catch (error) {
      // 如果更新失败，记录警告但不影响主流程
      console.warn(`Failed to update translateLanguages in config.yaml: ${error.message}`);
    }

    // 7. 生成翻译任务
    // 将 targetLanguages 转换为对象数组，以便 iterate_on 可以使用
    const translationTasks = docPaths.map((path) => ({
      path,
      sourceLanguage,
      force,
      targetLanguages: targetLanguages.map((lang) => ({ language: lang })),
    }));

    return {
      success: true,
      translationTasks,
      sourceLanguage,
      targetLanguages,
      totalDocs: docPaths.length,
      message: `准备翻译 ${docPaths.length} 个文档到 ${targetLanguages.length} 种语言 (${targetLanguages.join(", ")})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `准备翻译任务时发生错误: ${error.message}`,
      suggestion: "请检查文件系统权限和文件格式",
    };
  }
}

// 添加描述信息
prepareTranslation.description =
  "检查翻译参数、过滤目标语言、收集文档路径，为批量翻译做准备。" +
  "自动从 config.yaml 读取源语言，过滤与源语言相同的目标语言，" +
  "验证文档路径是否在 planning/document-structure.yaml 中存在。";

// 定义输入 schema
prepareTranslation.input_schema = {
  type: "object",
  properties: {
    docs: {
      type: "array",
      items: { type: "string" },
      description: "要翻译的文档路径列表（可选，不传则翻译所有文档）",
    },
    langs: {
      type: "array",
      items: { type: "string" },
      description: "目标语言列表（必需，至少一个）",
    },
    force: {
      type: "boolean",
      description: "是否强制重新翻译（可选，默认 false。设为 true 时即使源文档未变化也重新翻译）",
    },
  },
  required: ["langs"],
};

// 定义输出 schema
prepareTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    translationTasks: {
      type: "array",
      description: "翻译任务列表（成功时存在）",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          sourceLanguage: { type: "string" },
          targetLanguages: {
            type: "array",
            items: { type: "object", properties: { language: { type: "string" } } },
          },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码",
    },
    targetLanguages: {
      type: "array",
      items: { type: "string" },
      description: "过滤后的目标语言列表",
    },
    totalDocs: {
      type: "number",
      description: "总文档数",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
    skipped: {
      type: "boolean",
      description: "是否跳过翻译",
    },
    error: {
      type: "string",
      description: "错误代码（失败时存在）",
    },
    suggestion: {
      type: "string",
      description: "建议操作（失败时存在）",
    },
    invalidPaths: {
      type: "array",
      items: { type: "string" },
      description: "无效的文档路径列表（失败时存在）",
    },
  },
};
