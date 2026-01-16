import { access } from "node:fs/promises";
import { constants } from "node:fs";
import validateDocumentContent from "./validate-content.mjs";
import { cleanInvalidDocs, formatCleanResult } from "./clean-invalid-docs.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Document Content Fixer Class
 *
 * Note: Current version is mainly for future extension, specific auto-fix functionality is not yet implemented
 * Document content fixes usually require manual judgment due to semantic issues like link targets and image content
 */
class DocumentContentFixer {
  constructor() {
    this.fixCount = 0;
  }

  /**
   * Apply all fixes
   */
  async applyFixes(errors, docsDir) {
    for (const error of errors) {
      await this.applyFix(error, docsDir);
    }
    return this.fixCount;
  }

  /**
   * Apply single fix
   */
  async applyFix(_error, _docsDir) {
    // Current version does not implement auto-fix
    // Future additions may include:
    // - Link format correction (adding .md suffix, etc.)
    // - Image path level correction
    // - Markdown format optimization
    return;
  }
}

/**
 * Main function - Intelligent Content Checker
 * @param {Object} params - Check parameters
 * @param {string[]} params.docs - Array of document paths to check, e.g., ["/overview", "/api/introduction"], checks all documents if not provided
 * @returns {Promise<Object>} - Check and fix result
 */
export default async function checkContent({ docs = undefined } = {}) {
  const yamlPath = PATHS.DOCUMENT_STRUCTURE;
  const docsDir = PATHS.DOCS_DIR;
  const autoFix = true;
  const checkRemoteImages = true;
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
          `2. Incorrect file name - confirm the file name is ${yamlPath}\n` +
          `3. Document structure not yet generated - please execute step 4 to generate ${yamlPath}\n`,
      };
    }

    // Check if document directory exists
    try {
      await access(docsDir, constants.F_OK);
    } catch (_error) {
      return {
        success: false,
        valid: false,
        message:
          `❌ Document directory not found: ${docsDir}/\n\n` +
          `Possible reasons:\n` +
          `1. Documents not yet generated - please execute step 6.1 to generate document content\n` +
          `2. Incorrect directory path - confirm document directory is ${docsDir}/\n`,
      };
    }

    // 2. Layer 0: Clean invalid documents
    const cleanResult = await cleanInvalidDocs({ yamlPath, docsDir });
    const cleanMessage = formatCleanResult(cleanResult);
    const cleaned = {
      folders: cleanResult.deletedFolders.length,
      files: cleanResult.deletedFiles.length,
    };

    // 3. Call validation
    const validationResult = await validateDocumentContent({
      yamlPath,
      docsDir,
      docs,
      checkRemoteImages,
    });

    // 4. If validation passes, return directly
    if (validationResult.valid) {
      return {
        success: true,
        valid: true,
        cleaned,
        message: cleanMessage + validationResult.message,
      };
    }

    // 5. If there are FIXABLE errors and autoFix=true, attempt auto-fix
    if (autoFix && validationResult.errors?.fixable?.length > 0) {
      const fixer = new DocumentContentFixer();
      const fixedCount = await fixer.applyFixes(validationResult.errors.fixable, docsDir);

      if (fixedCount > 0) {
        // Re-validate
        const revalidation = await validateDocumentContent({
          yamlPath,
          docsDir,
          docs,
          checkRemoteImages,
        });

        // Return fix result
        if (revalidation.valid) {
          return {
            success: true,
            valid: true,
            fixed: true,
            fixedCount,
            cleaned,
            message:
              cleanMessage +
              `✅ Successfully fixed ${fixedCount} errors.\n\n` +
              `⚠️  Important: Files have been updated, please use the Read tool to re-read related documents for the latest content.\n\n` +
              revalidation.message,
          };
        } else {
          // Partial fix
          return {
            success: false,
            valid: false,
            fixed: true,
            fixedCount,
            cleaned,
            message:
              cleanMessage +
              `⚠️  Fixed ${fixedCount} errors, but the following issues still require manual handling:\n\n` +
              `Important: Files have been updated, please use the Read tool to re-read related documents to view current state.\n\n` +
              `Issues to fix:\n\n` +
              revalidation.message,
            remainingErrors: revalidation.errors,
          };
        }
      }
    }

    // 6. Cannot auto-fix or auto-fix not enabled, return error message
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
      message: `❌ Check failed: ${error.message}`,
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
        "Array of document paths to check, e.g., ['/overview', '/api/introduction'], checks all documents if not provided",
    },
  },
};
