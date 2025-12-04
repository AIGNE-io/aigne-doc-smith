import { syncDiagramToTranslations } from "../../utils/sync-diagram-to-translations.mjs";
import { readFileContent } from "../../utils/docs-finder-utils.mjs";
import { getFileName } from "../../utils/utils.mjs";
import { debug } from "../../utils/debug.mjs";

/**
 * Sync images to translations and exit if shouldSyncImages is true
 * Otherwise, passes through input for normal update flow
 * 
 * This agent combines:
 * - Image synchronization logic
 * - Flow routing (sync vs normal update)
 * - Early exit handling
 */
export default async function syncImagesAndExit(input, options) {
  // If shouldSyncImages is false, pass through for normal update flow
  if (!input.shouldSyncImages) {
    return input;
  }

  // Sync images flow
  const { selectedDocs = [], docsDir, locale = "en" } = input;

  if (!docsDir) {
    throw new Error("docsDir is required for image sync. Please ensure config is loaded.");
  }

  if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) {
    const actionSuccessAgent = options.context?.agents?.["actionSuccess"];
    if (actionSuccessAgent) {
      await options.context.invoke(actionSuccessAgent, {
        action: "ℹ️  No documents selected for image sync",
      });
    }
    // Exit normally to prevent passing to next steps
    process.exit(0);
  }

  const results = {
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Process each document
  for (const doc of selectedDocs) {
    try {
      // Use content from doc if available, otherwise read from file
      let mainContent = doc.content;
      if (!mainContent) {
        const mainFileName = getFileName(doc.path, locale);
        mainContent = await readFileContent(docsDir, mainFileName);
      }

      if (!mainContent) {
        debug(`⚠️  Could not read main document: ${doc.path}`);
        results.skipped++;
        continue;
      }

      // Sync images to translation documents
      const syncResult = await syncDiagramToTranslations(
        mainContent,
        mainContent,
        doc.path,
        docsDir,
        locale,
      );

      results.updated += syncResult.updated;
      results.skipped += syncResult.skipped;
      results.errors.push(...syncResult.errors);

      if (syncResult.updated > 0) {
        debug(`✅ Synced images from ${doc.path} to ${syncResult.updated} translation file(s)`);
      } else if (syncResult.skipped > 0) {
        debug(`⏭️  No changes needed for ${doc.path} (${syncResult.skipped} translation file(s) already in sync)`);
      }
    } catch (error) {
      debug(`❌ Error syncing images for ${doc.path}: ${error.message}`);
      results.errors.push({
        doc: doc.path,
        error: error.message,
      });
    }
  }

  // Generate success message
  const message = `✅ Image sync completed: ${results.updated} translation file(s) updated, ${results.skipped} skipped${
    results.errors.length > 0 ? `, ${results.errors.length} error(s)` : ""
  }`;

  // Show success message
  const actionSuccessAgent = options.context?.agents?.["actionSuccess"];
  if (actionSuccessAgent) {
    await options.context.invoke(actionSuccessAgent, {
      action: message,
    });
  }

  // Exit normally to prevent passing to next steps and avoid validation errors
  // This ensures a clean exit after successful image sync
  process.exit(0);
}

syncImagesAndExit.input_schema = {
  type: "object",
  properties: {
    shouldSyncImages: {
      type: "boolean",
      description: "Whether to trigger image sync to translations",
    },
    selectedDocs: {
      type: "array",
      description: "Array of selected documents to sync images from",
    },
    docsDir: {
      type: "string",
      description: "Documentation directory where documents are stored",
    },
    locale: {
      type: "string",
      description: "Main language locale (e.g., 'en', 'zh')",
      default: "en",
    },
  },
  required: ["shouldSyncImages"],
};

syncImagesAndExit.output_schema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Summary message of the sync operation",
    },
    updated: {
      type: "number",
      description: "Number of translation files successfully updated",
    },
    skipped: {
      type: "number",
      description: "Number of translation files skipped (no changes needed)",
    },
    errors: {
      type: "array",
      description: "Array of errors encountered during sync",
    },
  },
};

syncImagesAndExit.task_render_mode = "hide";

