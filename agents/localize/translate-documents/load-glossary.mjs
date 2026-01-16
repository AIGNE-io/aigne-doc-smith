import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { PATHS } from "../../../utils/agent-constants.mjs";

/**
 * 加载术语表
 * @returns {Promise<Object>} - 包含术语表内容的对象
 */
export default async function loadGlossary() {
  const glossaryPath = PATHS.GLOSSARY;

  try {
    // 检查术语表文件是否存在
    await access(glossaryPath, constants.F_OK | constants.R_OK);

    // 读取术语表内容
    const glossary = await readFile(glossaryPath, "utf8");

    return {
      glossary: glossary.trim(),
      message: `已加载术语表: ${glossaryPath}`,
    };
  } catch (_error) {
    // 术语表文件不存在，返回空字符串
    return {
      glossary: "",
      message: "未找到术语表文件，将不使用术语表",
    };
  }
}

// 添加描述信息
loadGlossary.description =
  "加载翻译术语表文件 (intent/GLOSSARY.md)。" +
  "如果文件存在则读取内容，否则返回空字符串。" +
  "术语表内容将在所有翻译任务中使用，确保专有词汇的一致性。";

// 定义输出 schema
loadGlossary.output_schema = {
  type: "object",
  required: ["glossary", "message"],
  properties: {
    glossary: {
      type: "string",
      description: "术语表内容（如不存在则为空字符串）",
    },
    message: {
      type: "string",
      description: "操作结果描述",
    },
  },
};
