import { readFile } from "node:fs/promises";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Document Structure Validator Class
 */
class DocumentStructureValidator {
  constructor(yamlContent) {
    this.yamlContent = yamlContent;
    this.errors = { fatal: [], fixable: [], warnings: [] };
    this.pathSet = new Set();
    this.documentCount = 0;
  }

  /**
   * Execute complete validation
   */
  async validate() {
    // Layer 1: YAML parsing
    try {
      this.data = yamlParse(this.yamlContent);
    } catch (e) {
      this.errors.fatal.push({
        type: "YAML_PARSE_ERROR",
        message: `YAML parse error: ${e.message}`,
        line: e.linePos?.start.line,
      });
      return this.getResult();
    }

    // Layer 2: Schema structure
    this.validateSchema();

    // Layer 3: Document fields (recursive validation)
    if (this.data.documents && Array.isArray(this.data.documents)) {
      this.data.documents.forEach((doc, idx) => {
        this.validateDocument(doc, `documents[${idx}]`, true);
      });
    }

    // Layer 4: Advanced rules
    this.validateAdvancedRules();

    return this.getResult();
  }

  /**
   * Validate Schema structure
   */
  validateSchema() {
    // Check project field
    if (!this.data.project) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: "project",
        message: "Missing required field: project",
      });
    } else {
      if (!this.data.project.title || typeof this.data.project.title !== "string") {
        this.errors.fatal.push({
          type: "MISSING_FIELD",
          path: "project.title",
          message: "Missing or invalid project.title",
          suggestion: "Please add project title",
        });
      }
      if (!this.data.project.description || typeof this.data.project.description !== "string") {
        this.errors.fatal.push({
          type: "MISSING_FIELD",
          path: "project.description",
          message: "Missing or invalid project.description",
          suggestion: "Please add project description",
        });
      }
    }

    // Check documents field
    if (!this.data.documents) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: "documents",
        message: "Missing required field: documents",
      });
    } else if (!Array.isArray(this.data.documents)) {
      this.errors.fatal.push({
        type: "INVALID_TYPE",
        path: "documents",
        message: "documents must be an array",
      });
    } else if (this.data.documents.length === 0) {
      this.errors.fatal.push({
        type: "EMPTY_DOCUMENTS",
        path: "documents",
        message: "documents array cannot be empty",
      });
    }
  }

  /**
   * Recursively validate document
   */
  validateDocument(doc, path, isTopLevel = false) {
    this.documentCount++;

    // Validate required fields
    if (!doc.title || typeof doc.title !== "string") {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.title`,
        message: "Missing or invalid title",
      });
    }

    if (!doc.description || typeof doc.description !== "string") {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.description`,
        message: "Missing or invalid description",
      });
    }

    // Validate path
    if (!doc.path) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.path`,
        message: "Missing path field",
      });
    } else {
      const pathErrors = this.validatePath(doc.path, path);
      this.errors.fixable.push(...pathErrors);

      // Check path should not end with .md (this is a FATAL error)
      if (doc.path.endsWith(".md")) {
        this.errors.fatal.push({
          type: "PATH_FORMAT",
          path: `${path}.path`,
          current: doc.path,
          expected: doc.path.slice(0, -3),
          message: "path should not end with .md (should point to folder)",
          suggestion: `Change path to "${doc.path.slice(0, -3)}"`,
        });
      }

      // Check path uniqueness
      if (this.pathSet.has(doc.path)) {
        this.errors.fatal.push({
          type: "DUPLICATE_PATH",
          path: `${path}.path`,
          value: doc.path,
          message: `Duplicate path: ${doc.path}`,
        });
      }
      this.pathSet.add(doc.path);
    }

    // Validate sourcePaths
    if (doc.sourcePaths === undefined) {
      this.errors.fatal.push({
        type: "MISSING_FIELD",
        path: `${path}.sourcePaths`,
        message: "Missing sourcePaths field",
      });
    } else {
      const sourceErrors = this.validateSourcePaths(doc.sourcePaths, path);
      this.errors.fixable.push(...sourceErrors.fixable);
      this.errors.warnings.push(...sourceErrors.warnings);
    }

    // Validate icon
    const iconErrors = this.validateIcon(doc.icon, isTopLevel, path, doc.title);
    this.errors.fixable.push(...iconErrors.fixable);
    this.errors.fatal.push(...iconErrors.fatal);

    // Recursively validate children
    if (doc.children) {
      if (!Array.isArray(doc.children)) {
        this.errors.fatal.push({
          type: "INVALID_TYPE",
          path: `${path}.children`,
          message: "children must be an array",
        });
      } else {
        doc.children.forEach((child, idx) => {
          this.validateDocument(child, `${path}.children[${idx}]`, false);
        });
      }
    }
  }

  /**
   * Validate path format
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
        message: "path must start with /",
      });
    }

    return errors;
  }

  /**
   * Validate sourcePaths
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
        message: "sourcePaths must be an array",
      });
      return errors;
    }

    if (sourcePaths.length === 0) {
      errors.warnings.push({
        type: "EMPTY_SOURCES",
        path: `${location}.sourcePaths`,
        message: "sourcePaths is empty array - no source files referenced",
      });
    }

    sourcePaths.forEach((srcPath, idx) => {
      if (typeof srcPath !== "string") {
        errors.fixable.push({
          type: "INVALID_TYPE",
          path: `${location}.sourcePaths[${idx}]`,
          message: "Source file path must be a string",
        });
      } else if (srcPath.startsWith("workspace:")) {
        errors.fixable.push({
          type: "SOURCE_PATH_PREFIX",
          path: `${location}.sourcePaths[${idx}]`,
          current: srcPath,
          expected: srcPath.replace("workspace:", ""),
          fix: "remove_workspace_prefix",
          message: "Remove workspace: prefix",
        });
      }
    });

    return errors;
  }

  /**
   * Validate icon
   */
  validateIcon(icon, isTopLevel, location, docTitle) {
    const errors = { fixable: [], fatal: [] };

    if (isTopLevel) {
      // Top-level documents must have icon
      if (!icon) {
        errors.fatal.push({
          type: "MISSING_ICON",
          path: `${location}.icon`,
          docTitle: docTitle || "Unknown document",
          message: `Top-level document "${docTitle || "Unknown document"}" missing icon`,
          suggestion: `Please select an appropriate icon based on document content, common options:
  - lucide:book-open (documentation, overview)
  - lucide:rocket (quick start, getting started)
  - lucide:code (API, code reference)
  - lucide:settings (configuration, settings)
  - lucide:file-text (guide, tutorial)
  - lucide:package (component, module)
More icons at: https://lucide.dev/icons`,
        });
      } else if (!icon.startsWith("lucide:")) {
        errors.fixable.push({
          type: "ICON_FORMAT",
          path: `${location}.icon`,
          current: icon,
          expected: `lucide:${icon}`,
          fix: "add_lucide_prefix",
          message: "icon must start with lucide:",
        });
      }
    } else {
      // Child documents should not have icon
      if (icon) {
        errors.fixable.push({
          type: "EXTRA_ICON",
          path: `${location}.icon`,
          current: icon,
          fix: "remove_icon",
          message: "Child documents should not contain icon field",
        });
      }
    }

    return errors;
  }

  /**
   * Advanced rules validation
   */
  validateAdvancedRules() {
    // Check nesting depth
    const maxDepth = this.getMaxDepth(this.data.documents);
    if (maxDepth > 3) {
      this.errors.warnings.push({
        type: "DEEP_NESTING",
        message: `Document structure nested ${maxDepth} levels deep (recommended ≤3 levels)`,
      });
    }
  }

  /**
   * Get maximum nesting depth
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
   * Get validation result
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
 * Format output
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

  // FATAL errors
  if (result.errors.fatal.length > 0) {
    output += "FATAL ERRORS (must fix before proceeding):\n\n";
    result.errors.fatal.forEach((err, idx) => {
      output += `${idx + 1}. ${err.type} at ${err.path || "unknown"}\n`;
      output += `   ${err.message}\n`;
      if (err.suggestion) {
        output += `   Suggestion: ${err.suggestion}\n`;
      }
      output += "\n";
    });
  }

  // FIXABLE errors
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
 * Main function - Function Agent
 * @param {Object} params
 * @param {string} params.yamlPath - YAML file path
 * @returns {Promise<Object>} - Validation result
 */
export default async function validateYamlStructure({ yamlPath = PATHS.DOCUMENT_STRUCTURE }) {
  try {
    // Read YAML file
    const content = await readFile(yamlPath, "utf8");

    // Execute validation
    const validator = new DocumentStructureValidator(content);
    const result = await validator.validate();

    // Format output
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
        message: `❌ FAIL: File not found: ${yamlPath}`,
      };
    }
    if (error.code === "EACCES") {
      return {
        valid: false,
        message: `❌ FAIL: Cannot read file (access denied)`,
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

// Export for testing - allows testing internal utility methods
export { DocumentStructureValidator, formatOutput };
