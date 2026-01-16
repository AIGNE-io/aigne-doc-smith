import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { stringify as yamlStringify } from "yaml";
import path from "node:path";
import {
  normalizePath,
  loadDocumentPaths,
  isValidDocumentPath,
} from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES, FILE_TYPES, DOC_META_DEFAULTS } from "../../utils/agent-constants.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * 创建文档文件夹和文件
 * @param {string} filePath - 文件路径（不带斜杠）
 * @param {string} language - 语言代码
 * @param {string} content - 文档内容
 * @returns {Promise<Object>} - 创建的文件路径
 */
async function createDocumentFiles(filePath, language, content) {
  const docFolder = path.join(PATHS.DOCS_DIR, filePath);

  // 1. 创建文件夹（递归创建，如果已存在则忽略）
  await mkdir(docFolder, { recursive: true });

  // 2. 生成 .meta.yaml
  const metaContent = yamlStringify({
    kind: DOC_META_DEFAULTS.KIND,
    source: language,
    default: language,
  });
  const metaPath = path.join(docFolder, FILE_TYPES.META);
  await writeFile(metaPath, metaContent, "utf8");

  // 3. 保存语言文件
  const langFile = `${language}${FILE_TYPES.MARKDOWN}`;
  const langPath = path.join(docFolder, langFile);
  await writeFile(langPath, content, "utf8");

  return {
    folder: docFolder,
    metaFile: metaPath,
    contentFile: langPath,
  };
}

/**
 * 保存文档到 docs 目录
 * @param {Object} params - 参数
 * @param {string} params.path - 文档路径（可带或不带斜杠）
 * @param {string} params.content - 文档内容（Markdown 格式）
 * @param {Object} params.options - 选项
 * @param {string} params.options.language - 语言代码（如 zh, en, ja）
 * @returns {Promise<Object>} - 操作结果
 */
export default async function saveDocument({ path: rawPath, content, options = {} }) {
  try {
    // 1. 参数校验：content
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return {
        success: false,
        error: ERROR_CODES.EMPTY_CONTENT,
        message: "文档内容不能为空",
        suggestion: "请提供有效的文档内容",
      };
    }

    // 2. 参数校验：language
    const language = options.language;
    if (!language || typeof language !== "string") {
      return {
        success: false,
        error: ERROR_CODES.INVALID_LANGUAGE,
        message: `语言代码无效: ${language}`,
        suggestion: "请提供有效的语言代码（如 zh, en, ja）",
      };
    }

    // 校验语言代码格式（如 zh, en, zh-CN, en-US）
    const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languagePattern.test(language)) {
      return {
        success: false,
        error: ERROR_CODES.INVALID_LANGUAGE,
        message: `语言代码格式不正确: ${language}`,
        suggestion: "语言代码应符合格式：zh, en, ja 或 zh-CN, en-US 等",
      };
    }

    // 3. 参数校验：path
    if (!rawPath || typeof rawPath !== "string") {
      return {
        success: false,
        error: ERROR_CODES.INVALID_PATH,
        message: "文档路径无效",
        suggestion: "请提供有效的文档路径",
      };
    }

    // 4. 标准化路径
    const { filePath, displayPath } = normalizePath(rawPath);

    // 5. 加载并校验文档结构
    let validPaths;
    try {
      validPaths = await loadDocumentPaths({ includeBothFormats: true });
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_STRUCTURE_FILE,
          message: `文档结构文件不存在: ${PATHS.DOCUMENT_STRUCTURE}`,
          suggestion: "请先生成文档结构文件",
        };
      }
      throw error;
    }

    // 6. 校验 path 是否在文档结构中
    if (!isValidDocumentPath(rawPath, validPaths)) {
      return {
        success: false,
        error: ERROR_CODES.PATH_NOT_IN_STRUCTURE,
        message: `文档路径 ${displayPath} 不存在于文档结构中`,
        suggestion: `请先在 ${PATHS.DOCUMENT_STRUCTURE} 中添加此路径，或检查路径是否正确`,
      };
    }

    // 7. 检查新建文档时 language 必须等于项目 locale
    const docFolder = path.join(PATHS.DOCS_DIR, filePath);
    const metaPath = path.join(docFolder, FILE_TYPES.META);
    const isNewDocument = !existsSync(metaPath);

    if (isNewDocument) {
      let projectLocale;
      try {
        projectLocale = await loadLocale();
      } catch (_error) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_CONFIG_FILE,
          message: "无法读取项目配置文件",
          suggestion: "请确保 config.yaml 存在且包含 locale 字段",
        };
      }

      if (language !== projectLocale) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_LANGUAGE,
          message: `新建文档时必须使用项目主语言: ${projectLocale}，当前传入: ${language}`,
          suggestion: `请将 language 参数改为 "${projectLocale}"（项目 locale），首先生成主语言版本`,
        };
      }
    }

    // 8. 创建文件夹和文件
    const files = await createDocumentFiles(filePath, language, content);

    // 9. 返回成功响应
    return {
      success: true,
      path: displayPath,
      folder: files.folder,
      files: {
        meta: files.metaFile,
        content: files.contentFile,
      },
      message: `文档保存成功: ${displayPath} (${language})`,
    };
  } catch (error) {
    // 捕获未预期的错误
    return {
      success: false,
      error: ERROR_CODES.FILE_OPERATION_ERROR,
      message: `文件操作失败: ${error.message}`,
      suggestion: "检查文件系统权限或路径是否正确",
    };
  }
}

// 添加描述信息
saveDocument.description =
  `保存文档到 ${PATHS.DOCS_DIR} 目录，自动创建文件夹结构、元信息文件和语言版本文件。` +
  "【重要限制】此工具仅用于新增文档时调用。编辑已有文档时，请直接使用 Edit 工具修改对应的语言文件。" +
  `使用前必须确保 ${PATHS.DOCUMENT_STRUCTURE} 已存在且包含目标文档路径。` +
  `【强制要求】新建文档时 language 必须等于项目 locale（config.yaml 中的 locale 字段），系统会自动验证。`;

// 定义输入 schema
saveDocument.input_schema = {
  type: "object",
  required: ["path", "content", "options"],
  properties: {
    path: {
      type: "string",
      description: "文档路径，必须在 planning/document-structure.yaml 中存在",
    },
    content: {
      type: "string",
      description: "文档内容（Markdown 格式），不能为空",
    },
    options: {
      type: "object",
      required: ["language"],
      properties: {
        language: {
          type: "string",
          description: "语言代码（如 zh, en, ja），必须从 config.yaml 的 locale 字段读取",
        },
      },
    },
  },
};

// 定义输出 schema
saveDocument.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "操作是否成功",
    },
    path: {
      type: "string",
      description: "标准化后的文档路径（成功时存在）",
    },
    folder: {
      type: "string",
      description: "创建的文件夹路径（成功时存在）",
    },
    files: {
      type: "object",
      description: "创建的文件路径（成功时存在）",
      properties: {
        meta: {
          type: "string",
          description: "元信息文件路径",
        },
        content: {
          type: "string",
          description: "语言文件路径",
        },
      },
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
