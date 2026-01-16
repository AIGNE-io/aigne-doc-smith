/**
 * Generate final summary report for image generation tasks
 * @param {Object} input - Input parameters
 * @param {string} input.locale - Main language
 * @param {Array} input.generationTasks - Generation task list (from prepare-generation)
 * @param {Array} input.processAllSlots - Execution result list (from team iterate)
 * @param {number} input.newTasks - Number of new tasks
 * @param {number} input.updateTasks - Number of update tasks
 * @param {number} input.skippedTasks - Number of skipped tasks
 * @returns {Object} - Object containing formatted message and statistics
 */
export default function generateSummary(input) {
  const { locale, generationTasks, processAllSlots, newTasks, updateTasks, skippedTasks } = input;

  // If no tasks
  if (!generationTasks || generationTasks.length === 0) {
    return {
      message: `⏭️  No image slots to generate`,
      summary: {
        locale,
        totalTasks: 0,
        newImages: 0,
        updatedImages: 0,
        skippedImages: skippedTasks || 0,
        successTasks: 0,
        failedTasks: 0,
        generatedImages: [],
      },
    };
  }

  // Count successful and failed tasks
  const results = processAllSlots || [];
  const successTasks = results.filter((r) => r?.success);
  const failedTasks = results.filter((r) => r && !r.success);

  const successCount = successTasks.length;
  const failedCount = failedTasks.length;

  // Generate list of successful image paths (show up to 10)
  const successPaths = successTasks.map((r) => r.imagePath).filter(Boolean);
  const displayPaths =
    successPaths.length > 10
      ? [...successPaths.slice(0, 10), `... and ${successPaths.length - 10} more images`]
      : successPaths;

  // Generate list of failed tasks
  const failedKeys = failedTasks.map((r) => ({
    key: r.key,
    error: r.message || r.error || "Unknown error",
  }));

  // Generate formatted message
  let message = `
✅ Image generation tasks completed

📊 **Generation Statistics**:
   - Main language: ${locale}
   - Total tasks: ${generationTasks.length}
   - New images: ${newTasks || 0}
   - Updated images: ${updateTasks || 0}
   - Skipped images: ${skippedTasks || 0}
   - Succeeded: ${successCount}
   - Failed: ${failedCount}
`;

  if (successPaths.length > 0) {
    message += `
📷 **Generated Images**:
${displayPaths.map((path) => `   - ${path}`).join("\n")}
`;
  }

  if (failedKeys.length > 0) {
    message += `
❌ **Failed Tasks**:
${failedKeys.map((f) => `   - ${f.key}: ${f.error}`).join("\n")}
`;
  }

  message += `
💡 **Tips**:
   - Images saved to assets/{key}/images/${locale}.png
   - Metadata saved to assets/{key}/.meta.yaml
  `;

  return {
    message: message.trim(),
    summary: {
      locale,
      totalTasks: generationTasks.length,
      newImages: newTasks || 0,
      updatedImages: updateTasks || 0,
      skippedImages: skippedTasks || 0,
      successTasks: successCount,
      failedTasks: failedCount,
      generatedImages: successPaths,
      failedKeys,
    },
  };
}

// Add description
generateSummary.description =
  "Generate final summary report for image generation tasks. " +
  "Aggregate generation statistics (main language, new/update/skip counts, success/failure tasks, etc.), generate readable formatted message. " +
  "List generated image paths and failed task information.";

// Define input schema
generateSummary.input_schema = {
  type: "object",
  properties: {
    locale: {
      type: "string",
      description: "Main language code",
    },
    generationTasks: {
      type: "array",
      description: "Generation task list",
      items: {
        type: "object",
      },
    },
    processAllSlots: {
      type: "array",
      description: "Execution result list",
      items: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          key: { type: "string" },
          imagePath: { type: "string" },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
    },
    newTasks: {
      type: "number",
      description: "Number of new tasks",
    },
    updateTasks: {
      type: "number",
      description: "Number of update tasks",
    },
    skippedTasks: {
      type: "number",
      description: "Number of skipped tasks",
    },
  },
};

// Define output schema
generateSummary.output_schema = {
  type: "object",
  required: ["message", "summary"],
  properties: {
    message: {
      type: "string",
      description: "Formatted summary message containing generation statistics and tips",
    },
    summary: {
      type: "object",
      description: "Structured statistics data",
      properties: {
        locale: {
          type: "string",
          description: "Main language code",
        },
        totalTasks: {
          type: "number",
          description: "Total task count",
        },
        newImages: {
          type: "number",
          description: "Number of new images",
        },
        updatedImages: {
          type: "number",
          description: "Number of updated images",
        },
        skippedImages: {
          type: "number",
          description: "Number of skipped images",
        },
        successTasks: {
          type: "number",
          description: "Number of successful tasks",
        },
        failedTasks: {
          type: "number",
          description: "Number of failed tasks",
        },
        generatedImages: {
          type: "array",
          items: { type: "string" },
          description: "List of generated image paths",
        },
        failedKeys: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              error: { type: "string" },
            },
          },
          description: "List of failed tasks",
        },
      },
    },
  },
};
