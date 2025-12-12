import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIXME: 临时使用这种方式设置自定义变量，框架优化后需要修改
export default function getCustomPrompt({ structureContent }) {
  let finalStructureContent = "文档结构未生成";
  if (structureContent) {
    finalStructureContent = `
\`\`\`yaml\n${structureContent}\n\`\`\`
    `;
  }
  const plannerInitState = `
文档结构(/modules/doc-smith/output/document_structure.yaml):
${finalStructureContent}
  `;

  const customPlannerPrompt = `
- 文档结构相关的任务与文档内容相关的任务需要拆分为独立的任务
- 你只需要读取少量信息来规划任务，深度的信息读取由 Worker 完成
- 可以在同一个任务中规划多篇文档的生成任务，Worker 中可以批量处理提升效率
- changeset 中要求的变更，拆分为独立的任务，由 Worker 完成
  `;

  const baseInfoPath = path.join(__dirname, "../common/base-info.md");
  const baseInfo = fs.readFileSync(baseInfoPath, "utf-8");

  const domainKnowledge = `
${baseInfo}

### 使用用文档相关的 Skill 完成任务
文档结构相关的任务使用：GenerateStructure
文档内容相关的任务使用：GenerateDetail
  `;

  return {
    plannerInitState,
    customPlannerPrompt,
    domainKnowledge,
  };
}
