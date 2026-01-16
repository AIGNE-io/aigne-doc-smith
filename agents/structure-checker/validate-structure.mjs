import { readFile } from "node:fs/promises";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 文档结构校验器类
 */
class DocumentStructureValidator {
  constructor(yamlContent) {
    this.yamlContent = yamlContent;
    this.errors = { fatal: [], fixable: [], warnings: [] };
    this.pathSet = new Set();
    this.documentCount = 0;
  }

  /**
   * 执行完整校验
   */
  async validate() {
    // Layer 1: YAML 解析
    try {
      this.data = yamlParse(this.yamlContent);
    } catch (e) {
      this.errors.fatal.push({
        type: "YAML_PARSE_ERROR",
        message: `YAML 解析错误: ${e.message}`,
        line: e.linePos?.start.line,
      });
      return this.getResult();
    }

    // Layer 2: Schema 结构
    this.validateSchema();

    // Layer 3: 文档字段（递归校验）
    if (this.data.documents && Array.isArray(this.data.documents)) {
      this.data.documents.forEach((doc, idx) => {
        this.validateDocument(doc, `documents[${idx}]`, true);
      });
    }

    // Layer 4: 高级规则
    this.validateAdvancedRules();

    return this.getResult();
  }

  /**
   * 校验 Schema 结构
   */
  validateSchema() {
    // 检查 project 字段
    if (!this.data.project) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: "project",
        message: "缺少必需字段: project",
      });
    } else {
      if (!this.data.project.title || typeof this.data.project.title !== "string") {
        this.errors.fatal.push({
          type: "MISSING_FIELD",
          path: "project.title",
          message: "缺少或无效的 project.title",
          suggestion: "请添加项目标题",
        });
      }
      if (!this.data.project.description || typeof this.data.project.description !== "string") {
        this.errors.fatal.push({
          type: "MISSING_FIELD",
          path: "project.description",
          message: "缺少或无效的 project.description",
          suggestion: "请添加项目描述",
        });
      }
    }

    // 检查 documents 字段
    if (!this.data.documents) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: "documents",
        message: "缺少必需字段: documents",
      });
    } else if (!Array.isArray(this.data.documents)) {
      this.errors.fatal.push({
        type: "INVALID_TYPE",
        path: "documents",
        message: "documents 必须是数组",
      });
    } else if (this.data.documents.length === 0) {
      this.errors.fatal.push({
        type: "EMPTY_DOCUMENTS",
        path: "documents",
        message: "documents 数组不能为空",
      });
    }
  }

  /**
   * 递归校验文档
   */
  validateDocument(doc, path, isTopLevel = false) {
    this.documentCount++;

    // 校验必需字段
    if (!doc.title || typeof doc.title !== "string") {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.title`,
        message: "缺少或无效的 title",
      });
    }

    if (!doc.description || typeof doc.description !== "string") {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.description`,
        message: "缺少或无效的 description",
      });
    }

    // 校验 path
    if (!doc.path) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.path`,
        message: "缺少 path 字段",
      });
    } else {
      const pathErrors = this.validatePath(doc.path, path);
      this.errors.fixable.push(...pathErrors);

      // 检查 path 不能以 .md 结尾（这是 FATAL 错误）
      if (doc.path.endsWith(".md")) {
        this.errors.fatal.push({
          type: "PATH_FORMAT",
          path: `${path}.path`,
          current: doc.path,
          expected: doc.path.slice(0, -3),
          message: "path 不应以 .md 结尾（应指向文件夹）",
          suggestion: `将 path 改为 "${doc.path.slice(0, -3)}"`,
        });
      }

      // 检查 path 唯一性
      if (this.pathSet.has(doc.path)) {
        this.errors.fatal.push({
          type: "DUPLICATE_PATH",
          path: `${path}.path`,
          value: doc.path,
          message: `重复的路径: ${doc.path}`,
        });
      }
      this.pathSet.add(doc.path);
    }

    // 校验 sourcePaths
    if (doc.sourcePaths === undefined) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.sourcePaths`,
        message: "缺少 sourcePaths 字段",
      });
    } else {
      const sourceErrors = this.validateSourcePaths(doc.sourcePaths, path);
      this.errors.fixable.push(...sourceErrors.fixable);
      this.errors.warnings.push(...sourceErrors.warnings);
    }

    // 校验 icon
    const iconErrors = this.validateIcon(doc.icon, isTopLevel, path, doc.title);
    this.errors.fixable.push(...iconErrors.fixable);
    this.errors.fatal.push(...iconErrors.fatal);

    // 递归校验 children
    if (doc.children) {
      if (!Array.isArray(doc.children)) {
        this.errors.fatal.push({
          type: "INVALID_TYPE",
          path: `${path}.children`,
          message: "children 必须是数组",
        });
      } else {
        doc.children.forEach((child, idx) => {
          this.validateDocument(child, `${path}.children[${idx}]`, false);
        });
      }
    }
  }

  /**
   * 校验 path 格式
   */
  validatePath(path, location) {
    const errors = [];

    if (typeof path !== "string") {
      return errors;
    }

    if (!path.startsWith("/")) {
      errors.push({
        type: "PATH_FORMAT",
        path: `${location}.path`,
        current: path,
        expected: `/${path}`,
        fix: "add_leading_slash",
        message: "path 必须以 / 开头",
      });
    }

    return errors;
  }

  /**
   * 校验 sourcePaths
   */
  validateSourcePaths(sourcePaths, location) {
    const errors = { fixable: [], warnings: [] };

    if (!Array.isArray(sourcePaths)) {
      errors.fixable.push({
        type: "INVALID_TYPE",
        path: `${location}.sourcePaths`,
        current: typeof sourcePaths,
        expected: "array",
        fix: "convert_to_array",
        message: "sourcePaths 必须是数组",
      });
      return errors;
    }

    if (sourcePaths.length === 0) {
      errors.warnings.push({
        type: "EMPTY_SOURCES",
        path: `${location}.sourcePaths`,
        message: "sourcePaths 为空数组 - 没有引用源文件",
      });
    }

    sourcePaths.forEach((srcPath, idx) => {
      if (typeof srcPath !== "string") {
        errors.fixable.push({
          type: "INVALID_TYPE",
          path: `${location}.sourcePaths[${idx}]`,
          message: "源文件路径必须是字符串",
        });
      } else if (srcPath.startsWith("workspace:")) {
        errors.fixable.push({
          type: "SOURCE_PATH_PREFIX",
          path: `${location}.sourcePaths[${idx}]`,
          current: srcPath,
          expected: srcPath.replace("workspace:", ""),
          fix: "remove_workspace_prefix",
          message: "移除 workspace: 前缀",
        });
      }
    });

    return errors;
  }

  /**
   * 校验 icon
   */
  validateIcon(icon, isTopLevel, location, docTitle) {
    const errors = { fixable: [], fatal: [] };

    if (isTopLevel) {
      // 顶层文档必须有 icon
      if (!icon) {
        errors.fatal.push({
          type: "MISSING_ICON",
          path: `${location}.icon`,
          docTitle: docTitle || "未知文档",
          message: `顶层文档 "${docTitle || "未知文档"}" 缺少 icon`,
          suggestion: `请根据文档内容选择合适的 icon，常用选项：
  - lucide:book-open (文档、概述)
  - lucide:rocket (快速开始、入门)
  - lucide:code (API、代码参考)
  - lucide:settings (配置、设置)
  - lucide:file-text (指南、教程)
  - lucide:package (组件、模块)
更多图标请参考：https://lucide.dev/icons`,
        });
      } else if (!icon.startsWith("lucide:")) {
        errors.fixable.push({
          type: "ICON_FORMAT",
          path: `${location}.icon`,
          current: icon,
          expected: `lucide:${icon}`,
          fix: "add_lucide_prefix",
          message: "icon 必须以 lucide: 开头",
        });
      }
    } else {
      // 子文档不应该有 icon
      if (icon) {
        errors.fixable.push({
          type: "EXTRA_ICON",
          path: `${location}.icon`,
          current: icon,
          fix: "remove_icon",
          message: "子文档不应该包含 icon 字段",
        });
      }
    }

    return errors;
  }

  /**
   * 高级规则校验
   */
  validateAdvancedRules() {
    // 检查嵌套深度
    const maxDepth = this.getMaxDepth(this.data.documents);
    if (maxDepth > 3) {
      this.errors.warnings.push({
        type: "DEEP_NESTING",
        message: `文档结构嵌套了 ${maxDepth} 层（建议 ≤3 层）`,
      });
    }
  }

  /**
   * 获取最大嵌套深度
   */
  getMaxDepth(docs, currentDepth = 1) {
    if (!docs || !Array.isArray(docs) || docs.length === 0) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const doc of docs) {
      if (doc.children && Array.isArray(doc.children) && doc.children.length > 0) {
        const childDepth = this.getMaxDepth(doc.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    return maxDepth;
  }

  /**
   * 获取校验结果
   */
  getResult() {
    const hasErrors = this.errors.fatal.length > 0 || this.errors.fixable.length > 0;

    return {
      valid: !hasErrors,
      errors: this.errors,
      summary: {
        totalDocuments: this.documentCount,
        totalErrors: this.errors.fatal.length + this.errors.fixable.length,
        fatalCount: this.errors.fatal.length,
        fixableCount: this.errors.fixable.length,
        warningCount: this.errors.warnings.length,
      },
    };
  }
}

/**
 * 格式化输出
 */
function formatOutput(result) {
  let output = "";

  if (result.valid) {
    output += "✅ PASS: document-structure.yaml is valid\n";
    output += `   Documents: ${result.summary.totalDocuments}\n`;
    if (result.summary.warningCount > 0) {
      output += `   Warnings: ${result.summary.warningCount}\n`;
    }
    return output;
  }

  output += "❌ FAIL: document-structure.yaml has errors\n\n";
  output += "Summary:\n";
  output += `  Total Documents: ${result.summary.totalDocuments}\n`;
  output += `  Fatal Errors: ${result.summary.fatalCount}\n`;
  output += `  Fixable Errors: ${result.summary.fixableCount}\n`;
  output += `  Warnings: ${result.summary.warningCount}\n\n`;

  // FATAL 错误
  if (result.errors.fatal.length > 0) {
    output += "FATAL ERRORS (must fix before proceeding):\n\n";
    result.errors.fatal.forEach((err, idx) => {
      output += `${idx + 1}. ${err.type} at ${err.path || "unknown"}\n`;
      output += `   ${err.message}\n`;
      if (err.suggestion) {
        output += `   建议: ${err.suggestion}\n`;
      }
      output += "\n";
    });
  }

  // FIXABLE 错误
  if (result.errors.fixable.length > 0) {
    output += "FIXABLE ERRORS (can be auto-corrected):\n\n";
    result.errors.fixable.forEach((err, idx) => {
      output += `${idx + 1}. ${err.type} at ${err.path}\n`;
      output += `   ${err.message}\n`;
      if (err.current) output += `   Current:  ${err.current}\n`;
      if (err.expected) output += `   Expected: ${err.expected}\n`;
      if (err.fix) output += `   Fix:      ${err.fix}\n`;
      output += "\n";
    });
    output += "Call the fix tool to auto-correct these errors:\n";
    output += "  Tool: fix_yaml_structure\n";
    output += '  Parameters: { yamlPath: "planning/document-structure.yaml" }\n\n';
  }

  // WARNING
  if (result.errors.warnings.length > 0) {
    output += "WARNINGS (informational):\n\n";
    result.errors.warnings.forEach((warn, idx) => {
      output += `${idx + 1}. ${warn.type || "WARNING"}: ${warn.message}\n`;
    });
    output += "\n";
  }

  return output;
}

/**
 * 主函数 - Function Agent
 * @param {Object} params
 * @param {string} params.yamlPath - YAML 文件路径
 * @returns {Promise<Object>} - 校验结果
 */
export default async function validateYamlStructure({ yamlPath = PATHS.DOCUMENT_STRUCTURE }) {
  try {
    // 读取 YAML 文件
    const content = await readFile(yamlPath, "utf8");

    // 执行校验
    const validator = new DocumentStructureValidator(content);
    const result = await validator.validate();

    // 格式化输出
    const formattedOutput = formatOutput(result);

    return {
      valid: result.valid,
      errors: result.errors,
      summary: result.summary,
      message: formattedOutput,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        valid: false,
        message: `❌ FAIL: 文件不存在: ${yamlPath}`,
      };
    }
    return {
      valid: false,
      message: `❌ FAIL: ${error.message}`,
    };
  }
}

validateYamlStructure.description = "Validate document-structure.yaml format and schema compliance";

validateYamlStructure.input_schema = {
  type: "object",
  properties: {
    yamlPath: {
      type: "string",
      description: "Path to the YAML file to validate (relative to workspace root)",
      default: "planning/document-structure.yaml",
    },
  },
};
