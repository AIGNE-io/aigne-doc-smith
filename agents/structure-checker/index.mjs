import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import validateYamlStructure from "./validate-structure.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 文档结构修复器类
 */
class DocumentStructureFixer {
  constructor(data) {
    this.data = data;
    this.fixCount = 0;
  }

  /**
   * 应用所有修复
   */
  applyFixes(errors) {
    for (const error of errors) {
      this.applyFix(error);
    }
    return this.fixCount;
  }

  /**
   * 应用单个修复
   */
  applyFix(error) {
    const pathParts = this.parsePath(error.path);

    switch (error.type) {
      case "PATH_FORMAT":
        this.fixPath(pathParts, error);
        break;
      case "SOURCE_PATH_PREFIX":
        this.fixSourcePath(pathParts, error);
        break;
      case "ICON_FORMAT":
        this.fixIconFormat(pathParts, error);
        break;
      case "EXTRA_ICON":
        this.removeIcon(pathParts);
        break;
      default:
        break;
    }
  }

  /**
   * 修复 path 格式
   */
  fixPath(pathParts, error) {
    // 移除最后的字段名 'path'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc || !doc.path) return;

    let fixed = false;

    if (error.fix === "add_leading_slash" && !doc.path.startsWith("/")) {
      doc.path = `/${doc.path}`;
      fixed = true;
    }

    // 移除：不再自动添加 .md 后缀
    // if (error.fix === "add_md_extension" && !doc.path.endsWith(".md")) {
    //   doc.path = `${doc.path}.md`;
    //   fixed = true;
    // }

    if (fixed) {
      this.fixCount++;
    }
  }

  /**
   * 修复 sourcePath 前缀
   */
  fixSourcePath(pathParts) {
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);

    if (!doc || !doc.sourcePaths || !Array.isArray(doc.sourcePaths)) return;

    const lastPart = pathParts[pathParts.length - 1];
    const match = lastPart.match(/\[(\d+)\]/);
    if (!match) return;

    const idx = parseInt(match[1], 10);
    if (doc.sourcePaths[idx]?.startsWith("workspace:")) {
      doc.sourcePaths[idx] = doc.sourcePaths[idx].replace("workspace:", "");
      this.fixCount++;
    }
  }

  /**
   * 修复 icon 格式
   */
  fixIconFormat(pathParts) {
    // 移除最后的字段名 'icon'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc || !doc.icon) return;

    if (!doc.icon.startsWith("lucide:")) {
      doc.icon = `lucide:${doc.icon}`;
      this.fixCount++;
    }
  }

  /**
   * 移除 icon
   */
  removeIcon(pathParts) {
    // 移除最后的字段名 'icon'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc) return;

    if (doc.icon !== undefined) {
      delete doc.icon;
      this.fixCount++;
    }
  }

  /**
   * 解析路径字符串
   */
  parsePath(path) {
    return path.split(/\.(?![^[]*\])/);
  }

  /**
   * 获取指定路径的文档对象
   */
  getDocument(pathParts) {
    let current = this.data;

    for (const part of pathParts) {
      if (part.includes("[")) {
        const match = part.match(/(\w+)\[(\d+)\]/);
        if (!match) return null;

        const [, key, idx] = match;
        current = current[key]?.[parseInt(idx, 10)];
      } else {
        current = current[part];
      }

      if (!current) return null;
    }

    return current;
  }
}

/**
 * 格式化剩余错误
 */
function formatRemainingErrors(errors) {
  const formatted = [];

  errors.fatal.forEach((err) => {
    formatted.push({
      path: err.path,
      message: err.message,
      action: err.suggestion || "请检查并修复此问题",
    });
  });

  errors.fixable.forEach((err) => {
    formatted.push({
      path: err.path,
      message: err.message,
      action: `预期值: ${err.expected || "请参考 schema"}`,
    });
  });

  return formatted;
}

/**
 * 主函数 - 智能结构检查器
 * @returns {Promise<Object>} - 检查和修复结果
 */
export default async function checkStructure() {
  const yamlPath = PATHS.DOCUMENT_STRUCTURE;
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
          `3. 文档结构尚未生成 - 请先执行步骤 4.1 生成 ${yamlPath}\n`,
      };
    }

    // 2. 调用校验
    const validationResult = await validateYamlStructure({
      yamlPath,
    });

    // 3. 如果校验通过，直接返回
    if (validationResult.valid) {
      return {
        success: true,
        valid: true,
        message: validationResult.message,
        summary: validationResult.summary,
      };
    }

    // 4. 如果有 FIXABLE 错误，先自动修复（无论是否有 FATAL 错误）
    if (validationResult.errors?.fixable?.length > 0) {
      const content = await readFile(yamlPath, "utf8");
      const data = yamlParse(content);

      const fixer = new DocumentStructureFixer(data);
      const fixedCount = fixer.applyFixes(validationResult.errors.fixable);

      // 重写 YAML 文件
      const fixedYaml = yamlStringify(data, {
        lineWidth: 0,
        defaultKeyType: "PLAIN",
        defaultStringType: "QUOTE_DOUBLE",
      });
      await writeFile(yamlPath, fixedYaml, "utf8");

      // 重新校验
      const revalidation = await validateYamlStructure({ yamlPath });

      // 返回修复结果
      if (revalidation.errors.fatal.length === 0 && revalidation.errors.fixable.length === 0) {
        return {
          success: false,
          valid: false,
          fixed: true,
          fixedCount,
          message: `⚠️  文件已更新，请使用 Read 工具重新读取 ${yamlPath} 并重新检查。`,
        };
      } else {
        // 部分修复
        const remainingErrors = formatRemainingErrors(revalidation.errors);
        const errorList = remainingErrors
          .map((err, idx) => {
            let msg = `${idx + 1}. ${err.message}`;
            if (err.path) msg += `\n   位置：${err.path}`;
            if (err.action) msg += `\n   操作：${err.action}`;
            return msg;
          })
          .join("\n\n");

        return {
          success: false,
          valid: false,
          fixed: true,
          fixedCount,
          message:
            `❌ 存在致命错误，无法自动修复。️文件已更新，请使用 Read 工具重新读取 ${yamlPath} 。\n\n` +
            `检测到以下问题：\n\n` +
            errorList,
          remainingErrors,
        };
      }
    }

    // 5. 如果只有 FATAL 错误（没有 FIXABLE 错误）
    if (validationResult.errors?.fatal?.length > 0) {
      const errorList = validationResult.errors.fatal
        .map((err, idx) => {
          let msg = `${idx + 1}. ${err.message}`;
          if (err.path) msg += `\n   位置：${err.path}`;
          if (err.suggestion) msg += `\n   操作：${err.suggestion}`;
          return msg;
        })
        .join("\n\n");

      return {
        success: false,
        valid: false,
        message: `❌ 存在致命错误，无法自动修复。请先解决以下问题：\n\n${errorList}`,
        errors: validationResult.errors.fatal,
      };
    }

    // 默认返回（不应该到达这里）
    return validationResult;
  } catch (error) {
    return {
      success: false,
      valid: false,
      message: `❌ 检查失败: ${error.message}`,
    };
  }
}

checkStructure.description =
  "Check and validate document structure YAML file at planning/document-structure.yaml, automatically fix format errors";
