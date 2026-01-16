/**
 * 生成图片生成任务的最终总结报告
 * @param {Object} input - 输入参数
 * @param {string} input.locale - 主语言
 * @param {Array} input.generationTasks - 生成任务列表（来自 prepare-generation）
 * @param {Array} input.processAllSlots - 执行结果列表（来自 team 的 iterate）
 * @param {number} input.newTasks - 新增任务数量
 * @param {number} input.updateTasks - 更新任务数量
 * @param {number} input.skippedTasks - 跳过的任务数量
 * @returns {Object} - 包含格式化消息和统计数据的对象
 */
export default function generateSummary(input) {
  const { locale, generationTasks, processAllSlots, newTasks, updateTasks, skippedTasks } = input;

  // 如果没有任务
  if (!generationTasks || generationTasks.length === 0) {
    return {
      message: `⏭️  没有需要生成的图片 slot`,
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

  // 统计成功和失败的任务
  const results = processAllSlots || [];
  const successTasks = results.filter((r) => r?.success);
  const failedTasks = results.filter((r) => r && !r.success);

  const successCount = successTasks.length;
  const failedCount = failedTasks.length;

  // 生成成功的图片路径列表（最多显示10个）
  const successPaths = successTasks.map((r) => r.imagePath).filter(Boolean);
  const displayPaths =
    successPaths.length > 10
      ? [...successPaths.slice(0, 10), `... 还有 ${successPaths.length - 10} 个图片`]
      : successPaths;

  // 生成失败的任务列表
  const failedKeys = failedTasks.map((r) => ({
    key: r.key,
    error: r.message || r.error || "未知错误",
  }));

  // 生成格式化的消息
  let message = `
✅ 图片生成任务已完成

📊 **生成统计**：
   - 主语言：${locale}
   - 总任务数：${generationTasks.length}
   - 新增图片：${newTasks || 0}
   - 更新图片：${updateTasks || 0}
   - 跳过图片：${skippedTasks || 0}
   - 成功：${successCount}
   - 失败：${failedCount}
`;

  if (successPaths.length > 0) {
    message += `
📷 **生成的图片**：
${displayPaths.map((path) => `   - ${path}`).join("\n")}
`;
  }

  if (failedKeys.length > 0) {
    message += `
❌ **失败的任务**：
${failedKeys.map((f) => `   - ${f.key}: ${f.error}`).join("\n")}
`;
  }

  message += `
💡 **提示**：
   - 图片已保存到 assets/{key}/images/${locale}.png
   - 元信息已保存到 assets/{key}/.meta.yaml
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

// 添加描述信息
generateSummary.description =
  "生成图片生成任务的最终总结报告。" +
  "汇总生成统计数据（主语言、新增/更新/跳过数量、成功/失败任务等），生成易读的格式化消息。" +
  "列出生成的图片路径和失败的任务信息。";

// 定义输入 schema
generateSummary.input_schema = {
  type: "object",
  properties: {
    locale: {
      type: "string",
      description: "主语言代码",
    },
    generationTasks: {
      type: "array",
      description: "生成任务列表",
      items: {
        type: "object",
      },
    },
    processAllSlots: {
      type: "array",
      description: "执行结果列表",
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
      description: "新增任务数量",
    },
    updateTasks: {
      type: "number",
      description: "更新任务数量",
    },
    skippedTasks: {
      type: "number",
      description: "跳过的任务数量",
    },
  },
};

// 定义输出 schema
generateSummary.output_schema = {
  type: "object",
  required: ["message", "summary"],
  properties: {
    message: {
      type: "string",
      description: "格式化的总结消息，包含生成统计和提示信息",
    },
    summary: {
      type: "object",
      description: "结构化的统计数据",
      properties: {
        locale: {
          type: "string",
          description: "主语言代码",
        },
        totalTasks: {
          type: "number",
          description: "总任务数",
        },
        newImages: {
          type: "number",
          description: "新增图片数量",
        },
        updatedImages: {
          type: "number",
          description: "更新图片数量",
        },
        skippedImages: {
          type: "number",
          description: "跳过图片数量",
        },
        successTasks: {
          type: "number",
          description: "成功任务数量",
        },
        failedTasks: {
          type: "number",
          description: "失败任务数量",
        },
        generatedImages: {
          type: "array",
          items: { type: "string" },
          description: "生成的图片路径列表",
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
          description: "失败的任务列表",
        },
      },
    },
  },
};
