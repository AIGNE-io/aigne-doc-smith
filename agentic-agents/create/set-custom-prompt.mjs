import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIXME: 临时使用这种方式设置自定义变量，框架优化后需要修改
export default function getCustomPrompt({ structureContent }, options) {
  let finalStructureContent = "文档结构未生成";
  if (structureContent) {
    finalStructureContent = `
    \`\`\`yaml\n${structureContent}\n\`\`\`
`;
  }
  options.context.userContext.plannerInitState = `
文档结构(/modules/doc-smith/output/document_structure.yaml):
${finalStructureContent}
  `;

  options.context.userContext.customPlannerPrompt = `
- 文档结构相关的任务与文档内容相关的任务需要拆分为独立的任务
- 可以在同一个任务中规划多篇文档的生成/更新任务，Worker 中可以批量处理提升效率

  `;

  const baseInfoPath = path.join(__dirname, "../common/base-info.md");
  const baseInfo = fs.readFileSync(baseInfoPath, "utf-8");

  options.context.userContext.domainKnowledge = `
${baseInfo}

### 使用用文档相关的 Skill 完成任务
文档结构相关的任务使用：GenerateStructure
文档内容相关的任务使用：GenerateDetail
  `;

  return {};
}
