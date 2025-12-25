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
文档结构(/modules/doc-smith/output/document-structure.yaml):
${finalStructureContent}
  `;

  const customPlannerPrompt = `
- 文档结构生成之后，需要按照'质量审查标准'，进行质量审查，并修复发现的问题
- 关键: 在保存 YAML 文件之前,严格验证格式:

✅ **正确格式示例:**
\`\`\`yaml
project:
  title: "我的项目"
  description: "项目的简要描述"

documents:
  - title: "概览"
    description: "项目介绍"
    path: /overview.md
    sourcePaths:
      - README.md
      - docs/intro.md
    children: []
  - title: "API 参考"
    description: "完整的 API 文档"
    path: /api-Reference.md
    sourcePaths:
      - docs/api.md
    children:
      - title: "核心 API"
        path: /core-api.md
        description: "核心功能"
        sourcePaths:
          - docs/api/core.md
        children: []
\`\`\`

❌ **要避免的常见错误:**
1. 冒号后缺少空格: \`title:"测试"\` (错误) → \`title: "测试"\` (正确)
2. 错误的缩进: 每级必须恰好 2 个空格
3. 列表项缺少破折号: \`documents: title: "测试"\` (错误) → \`documents: - title: "测试"\` (正确)
4. sourcePaths 中的目录路径: \`sourcePaths: - src/\` (错误) → \`sourcePaths: - src/index.ts\` (正确)
5. 包含模块前缀: \`/modules/workspace/README.md\` (错误) → \`README.md\` (正确)

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
