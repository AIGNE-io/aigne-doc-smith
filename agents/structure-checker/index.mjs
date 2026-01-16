import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import validateYamlStructure from "./validate-structure.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Document Structure Fixer Class
 */
class DocumentStructureFixer {
  constructor(data) {
    this.data = data;
    this.fixCount = 0;
  }

  /**
   * Apply all fixes
   */
  applyFixes(errors) {
    for (const error of errors) {
      this.applyFix(error);
    }
    return this.fixCount;
  }

  /**
   * Apply single fix
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
   * Fix path format
   */
  fixPath(pathParts, error) {
    // Remove last field name 'path'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc || !doc.path) return;

    let fixed = false;

    if (error.fix === "add_leading_slash" && !doc.path.startsWith("/")) {
      doc.path = `/${doc.path}`;
      fixed = true;
    }

    // Removed: no longer auto-add .md suffix
    // if (error.fix === "add_md_extension" && !doc.path.endsWith(".md")) {
    //   doc.path = `${doc.path}.md`;
    //   fixed = true;
    // }

    if (fixed) {
      this.fixCount++;
    }
  }

  /**
   * Fix sourcePath prefix
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
   * Fix icon format
   */
  fixIconFormat(pathParts) {
    // Remove last field name 'icon'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc || !doc.icon) return;

    if (!doc.icon.startsWith("lucide:")) {
      doc.icon = `lucide:${doc.icon}`;
      this.fixCount++;
    }
  }

  /**
   * Remove icon
   */
  removeIcon(pathParts) {
    // Remove last field name 'icon'
    const docPathParts = pathParts.slice(0, -1);
    const doc = this.getDocument(docPathParts);
    if (!doc) return;

    if (doc.icon !== undefined) {
      delete doc.icon;
      this.fixCount++;
    }
  }

  /**
   * Parse path string
   */
  parsePath(path) {
    return path.split(/\.(?![^[]*\])/);
  }

  /**
   * Get document object at specified path
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
 * Format remaining errors
 */
function formatRemainingErrors(errors) {
  const formatted = [];

  errors.fatal.forEach((err) => {
    formatted.push({
      path: err.path,
      message: err.message,
      action: err.suggestion || "Please check and fix this issue",
    });
  });

  errors.fixable.forEach((err) => {
    formatted.push({
      path: err.path,
      message: err.message,
      action: `Expected value: ${err.expected || "please refer to schema"}`,
    });
  });

  return formatted;
}

/**
 * Main function - Intelligent Structure Checker
 * @returns {Promise<Object>} - Check and fix result
 */
export default async function checkStructure() {
  const yamlPath = PATHS.DOCUMENT_STRUCTURE;
  try {
    // 1. Check if file exists
    try {
      await access(yamlPath, constants.F_OK);
    } catch (_error) {
      return {
        success: false,
        valid: false,
        fileNotFound: true,
        message:
          `❌ File not found: ${yamlPath}\n\n` +
          `Possible reasons:\n` +
          `1. Incorrect file path - please check if you are in the correct workspace directory\n` +
          `2. Incorrect file name - confirm file name is ${yamlPath}\n` +
          `3. Document structure not yet generated - please execute step 4.1 to generate ${yamlPath}\n`,
      };
    }

    // 2. Call validation
    const validationResult = await validateYamlStructure({
      yamlPath,
    });

    // 3. If validation passes, return directly
    if (validationResult.valid) {
      return {
        success: true,
        valid: true,
        message: validationResult.message,
        summary: validationResult.summary,
      };
    }

    // 4. If there are FIXABLE errors, auto-fix first (regardless of FATAL errors)
    if (validationResult.errors?.fixable?.length > 0) {
      const content = await readFile(yamlPath, "utf8");
      const data = yamlParse(content);

      const fixer = new DocumentStructureFixer(data);
      const fixedCount = fixer.applyFixes(validationResult.errors.fixable);

      // Rewrite YAML file
      const fixedYaml = yamlStringify(data, {
        lineWidth: 0,
        defaultKeyType: "PLAIN",
        defaultStringType: "QUOTE_DOUBLE",
      });
      await writeFile(yamlPath, fixedYaml, "utf8");

      // Re-validate
      const revalidation = await validateYamlStructure({ yamlPath });

      // Return fix result
      if (revalidation.errors.fatal.length === 0 && revalidation.errors.fixable.length === 0) {
        return {
          success: false,
          valid: false,
          fixed: true,
          fixedCount,
          message: `⚠️  File updated, please use Read tool to re-read ${yamlPath} and re-check.`,
        };
      } else {
        // Partial fix
        const remainingErrors = formatRemainingErrors(revalidation.errors);
        const errorList = remainingErrors
          .map((err, idx) => {
            let msg = `${idx + 1}. ${err.message}`;
            if (err.path) msg += `\n   Location: ${err.path}`;
            if (err.action) msg += `\n   Action: ${err.action}`;
            return msg;
          })
          .join("\n\n");

        return {
          success: false,
          valid: false,
          fixed: true,
          fixedCount,
          message:
            `❌ Fatal errors exist, cannot auto-fix. File updated, please use Read tool to re-read ${yamlPath}.\n\n` +
            `Issues detected:\n\n` +
            errorList,
          remainingErrors,
        };
      }
    }

    // 5. If only FATAL errors (no FIXABLE errors)
    if (validationResult.errors?.fatal?.length > 0) {
      const errorList = validationResult.errors.fatal
        .map((err, idx) => {
          let msg = `${idx + 1}. ${err.message}`;
          if (err.path) msg += `\n   Location: ${err.path}`;
          if (err.suggestion) msg += `\n   Action: ${err.suggestion}`;
          return msg;
        })
        .join("\n\n");

      return {
        success: false,
        valid: false,
        message: `❌ Fatal errors exist, cannot auto-fix. Please resolve the following issues first:\n\n${errorList}`,
        errors: validationResult.errors.fatal,
      };
    }

    // Default return (should not reach here)
    return validationResult;
  } catch (error) {
    return {
      success: false,
      valid: false,
      message: `❌ Check failed: ${error.message}`,
    };
  }
}

checkStructure.description =
  "Check and validate document structure YAML file at planning/document-structure.yaml, automatically fix format errors";
