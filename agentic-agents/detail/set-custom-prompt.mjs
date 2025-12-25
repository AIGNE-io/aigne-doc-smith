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
- 首先确定需要处理的是文档结构中的哪一篇文档
- 检查文档是否已存在,决定是生成新文档还是更新现有文档
- 文档详情以 markdown 的格式输出在 /modules/doc-smith/docs 目录中，根据文档的 \`path\` 生成文件名。
- 读取 sourcePaths 中的文件作为初始上下文，按需求读取更多的相关文件作为上下文
- 生成文档内容后，review 文档内容，确保符合文档质量标准

  `;

  const baseInfoPath = path.join(__dirname, "../common/base-info.md");
  const baseInfo = fs.readFileSync(baseInfoPath, "utf-8");

  const domainKnowledge = `
${baseInfo}

### 文档质量标准

#### 深度要求

每篇文档应该:
- 基于 sourcePaths 中的数据源生成详细准确的内容
- 根据需要读取更多相关数据源作为上下文
- 每个章节应尽可能参考更多相关数据源,使生成的文档详细准确

文档应该是**生产级别、可直接使用**的,而不是简单概述。

#### 必须包含的内容

- **代码示例**: 可运行的完整代码,包含必要的 import 语句
- **响应数据示例**: 所有接口和方法必须包含响应数据示例
- **配置参数说明**: 全面解释配置选项和参数,多值参数需解释每个选项的用途

#### 标准结构

每篇文档包含:
- **标题层级正确**: 总是以一级标题开始，标题层级连续
- **Opening Hook**: 简洁有力(≤50 词),说明读者将获得什么
- **引言**: 包含相关文档内链
- **主体**: 多个小节,含代码示例和说明
- **总结**: 包含延伸阅读链接(引导阅读其他相关文档)

#### 写作风格

- 简洁、严谨、准确
- 为人类写作,不是为算法
- 主动语态优先,可混用被动
- 直接表达: 发生了什么、为什么重要、如何帮助

#### 信息获取

- workspace 中的数据源需要主动探索和搜索
- 基于实际找到的信息生成文档
- 不编造或假设不存在的功能

#### 数据源使用

- 公开产品/技术: 可用已有知识补充
- 私有产品: 不能编造虚假信息
- 信息不足: 说明需要更多上下文

  `;

  return {
    plannerInitState,
    customPlannerPrompt,
    domainKnowledge,
  };
}
