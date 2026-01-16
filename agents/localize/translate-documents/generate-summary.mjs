/**
 * 生成翻译任务的最终总结报告
 * @param {Object} input - 输入参数
 * @param {Array} input.translationTasks - 翻译任务列表
 * @param {string} input.sourceLanguage - 源语言代码
 * @param {Array} input.targetLanguages - 目标语言列表
 * @param {number} input.totalDocs - 总文档数
 * @param {boolean} input.skipped - 是否跳过翻译
 * @returns {Object} - 包含格式化消息和统计数据的对象
 */
export default function generateSummary(input) {
  const { translationTasks, sourceLanguage, targetLanguages, totalDocs, skipped } = input;

  // 如果跳过了翻译
  if (skipped) {
    return {
      message: `⏭️  翻译已跳过：所有目标语言都与源语言 (${sourceLanguage}) 相同`,
      summary: {
        skipped: true,
        sourceLanguage,
        totalDocs: 0,
        totalLanguages: 0,
        totalTranslations: 0,
      },
    };
  }

  // 计算统计数据
  const totalLanguages = targetLanguages.length;
  const totalTranslations = totalDocs * totalLanguages;

  // 生成文档路径列表（最多显示5个）
  const docPaths = translationTasks.map((task) => task.path);
  const displayDocs =
    docPaths.length > 5
      ? [...docPaths.slice(0, 5), `... 还有 ${docPaths.length - 5} 个文档`]
      : docPaths;

  // 生成格式化的消息
  const message = `
✅ 翻译任务已完成

📊 **翻译统计**：
   - 源语言：${sourceLanguage}
   - 目标语言：${targetLanguages.join(", ")} (${totalLanguages} 种语言)
   - 文档数量：${totalDocs} 个
   - 总翻译数：${totalTranslations} 个翻译

📄 **翻译文档**：
${displayDocs.map((doc) => `   - ${doc}`).join("\n")}

💡 **提示**：
   - 翻译文件已保存到 docs/{path}/{language}.md
   - 文档的 .meta.yaml 已自动更新 languages 字段
   - 如需查看翻译结果，请检查对应的语言文件
  `.trim();

  return {
    message,
    summary: {
      skipped: false,
      sourceLanguage,
      targetLanguages,
      totalDocs,
      totalLanguages,
      totalTranslations,
      documentPaths: docPaths,
    },
  };
}

// 添加描述信息
generateSummary.description =
  "生成翻译任务的最终总结报告。" +
  "汇总翻译统计数据（源语言、目标语言、文档数量等），生成易读的格式化消息。" +
  "如果翻译被跳过，会生成相应的跳过提示。";

// 定义输入 schema
generateSummary.input_schema = {
  type: "object",
  properties: {
    translationTasks: {
      type: "array",
      description: "翻译任务列表",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          sourceLanguage: { type: "string" },
          targetLanguages: {
            type: "array",
            items: { type: "object", properties: { language: { type: "string" } } },
          },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "源语言代码",
    },
    targetLanguages: {
      type: "array",
      items: { type: "string" },
      description: "目标语言列表",
    },
    totalDocs: {
      type: "number",
      description: "总文档数",
    },
    skipped: {
      type: "boolean",
      description: "是否跳过翻译",
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
      description: "格式化的总结消息，包含翻译统计和提示信息",
    },
    summary: {
      type: "object",
      description: "结构化的统计数据",
      properties: {
        skipped: {
          type: "boolean",
          description: "是否跳过翻译",
        },
        sourceLanguage: {
          type: "string",
          description: "源语言代码",
        },
        targetLanguages: {
          type: "array",
          items: { type: "string" },
          description: "目标语言列表",
        },
        totalDocs: {
          type: "number",
          description: "总文档数",
        },
        totalLanguages: {
          type: "number",
          description: "目标语言总数",
        },
        totalTranslations: {
          type: "number",
          description: "总翻译数（文档数 × 语言数）",
        },
        documentPaths: {
          type: "array",
          items: { type: "string" },
          description: "所有翻译的文档路径列表",
        },
      },
    },
  },
};
