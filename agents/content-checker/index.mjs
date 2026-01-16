import { access } from "node:fs/promises";
import { constants } from "node:fs";
import validateDocumentContent from "./validate-content.mjs";
import { cleanInvalidDocs, formatCleanResult } from "./clean-invalid-docs.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 文档内容修复器类
 *
 * 注意：当前版本主要用于未来扩展，暂未实现具体的自动修复功能
 * 文档内容的修复通常需要人工判断，因为涉及到链接目标、图片内容等语义问题
 */
class DocumentContentFixer {
  constructor() {
    this.fixCount = 0;
  }

  /**
   * 应用所有修复
   */
  async applyFixes(errors, docsDir) {
    for (const error of errors) {
      await this.applyFix(error, docsDir);
    }
    return this.fixCount;
  }

  /**
   * 应用单个修复
   */
  async applyFix(_error, _docsDir) {
    // 当前版本暂不实现自动修复
    // 未来可以添加以下修复功能：
    // - 链接格式修正（添加 .md 后缀等）
    // - 图片路径层级修正
    // - Markdown 格式优化
    return;
  }
}

/**
 * 主函数 - 智能内容检查器
 * @param {Object} params - 检查参数
 * @param {string[]} params.docs - 要检查的文档路径数组，如 ["/overview", "/api/introduction"]，如果不提供则检查所有文档
 * @returns {Promise<Object>} - 检查和修复结果
 */
export default async function checkContent({ docs = undefined } = {}) {
  const yamlPath = PATHS.DOCUMENT_STRUCTURE;
  const docsDir = PATHS.DOCS_DIR;
  const autoFix = true;
  const checkRemoteImages = true;
  try {
    // 1. 检查文件是否存在
    try {
      await access(yamlPath, constants.F_OK);
    } catch (_error) {
      return {
        success: false,
        valid: false,
        fileNotFound: true,
        message:
          `❌ 文件不存在: ${yamlPath}\n\n` +
          `可能的原因：\n` +
          `1. 文件路径错误 - 请检查是否在正确的 workspace 目录中\n` +
          `2. 文件名称错误 - 确认文件名为 ${yamlPath}\n` +
          `3. 文档结构尚未生成 - 请先执行步骤 4 生成 ${yamlPath}\n`,
      };
    }

    // 检查文档目录是否存在
    try {
      await access(docsDir, constants.F_OK);
    } catch (_error) {
      return {
        success: false,
        valid: false,
        message:
          `❌ 文档目录不存在: ${docsDir}/\n\n` +
          `可能的原因：\n` +
          `1. 文档尚未生成 - 请先执行步骤 6.1 生成文档内容\n` +
          `2. 目录路径错误 - 确认文档目录为 ${docsDir}/\n`,
      };
    }

    // 2. Layer 0: 清理无效文档
    const cleanResult = await cleanInvalidDocs({ yamlPath, docsDir });
    const cleanMessage = formatCleanResult(cleanResult);
    const cleaned = {
      folders: cleanResult.deletedFolders.length,
      files: cleanResult.deletedFiles.length,
    };

    // 3. 调用校验
    const validationResult = await validateDocumentContent({
      yamlPath,
      docsDir,
      docs,
      checkRemoteImages,
    });

    // 4. 如果校验通过，直接返回
    if (validationResult.valid) {
      return {
        success: true,
        valid: true,
        cleaned,
        message: cleanMessage + validationResult.message,
      };
    }

    // 5. 如果有 FIXABLE 错误且 autoFix=true，尝试自动修复
    if (autoFix && validationResult.errors?.fixable?.length > 0) {
      const fixer = new DocumentContentFixer();
      const fixedCount = await fixer.applyFixes(validationResult.errors.fixable, docsDir);

      if (fixedCount > 0) {
        // 重新校验
        const revalidation = await validateDocumentContent({
          yamlPath,
          docsDir,
          docs,
          checkRemoteImages,
        });

        // 返回修复结果
        if (revalidation.valid) {
          return {
            success: true,
            valid: true,
            fixed: true,
            fixedCount,
            cleaned,
            message:
              cleanMessage +
              `✅ 已成功修复 ${fixedCount} 个错误。\n\n` +
              `⚠️  重要：文件已更新，请使用 Read 工具重新读取相关文档以获取最新内容。\n\n` +
              revalidation.message,
          };
        } else {
          // 部分修复
          return {
            success: false,
            valid: false,
            fixed: true,
            fixedCount,
            cleaned,
            message:
              cleanMessage +
              `⚠️  已修复 ${fixedCount} 个错误，但仍存在以下问题需要手动处理：\n\n` +
              `重要：文件已更新，请使用 Read 工具重新读取相关文档查看当前状态。\n\n` +
              `需要修复的问题：\n\n` +
              revalidation.message,
            remainingErrors: revalidation.errors,
          };
        }
      }
    }

    // 6. 无法自动修复或未启用自动修复，返回错误信息
    return {
      success: false,
      valid: false,
      cleaned,
      message: cleanMessage + validationResult.message,
      errors: validationResult.errors,
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      message: `❌ 检查失败: ${error.message}`,
    };
  }
}

checkContent.description =
  "Clean invalid documents and validate generated document content. Removes document folders not in document-structure.yaml and language files not in .meta.yaml. Then checks file existence, internal links, local and remote images.";

checkContent.input_schema = {
  type: "object",
  properties: {
    docs: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "要检查的文档路径数组，如 ['/overview', '/api/introduction']，如果不提供则检查所有文档",
    },
  },
};
