---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 提供了一个强大而灵活的配置系统，可根据您的特定需求定制文档生成过程。所有设置都通过一个中央文件 `config.yaml` 进行管理，该文件位于项目的 `.aigne/doc-smith/` 目录中。

尽管推荐通过 [交互式设置向导](./configuration-interactive-setup.md) 创建和管理此文件，但本指南为所有可用选项提供了详细参考，让您可以直接微调文档的风格、受众和结构。

## 配置文件结构

`config.yaml` 文件是您文档项目的核心。它定义了从项目名称到 AI 应生成内容的具体风格和深度的所有内容。以下是一个完整的配置文件示例，随后是对每个部分的详细说明。

```yaml config.yaml icon=mdi:file-cog-outline
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: 一款强大的、由 AI 驱动的文档生成工具。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者达成的最主要成果是什么？
documentPurpose:
  - getStarted
  - findAnswers

# 目标受众：谁会最常阅读本文档？
targetAudienceTypes:
  - developers
  - endUsers

# 读者知识水平：读者通常具备哪些背景知识？
readerKnowledgeLevel: completeBeginners

# 文档深度：文档应达到何种详细程度？
documentationDepth: balancedCoverage

# 自定义规则：定义具体的文档生成规则和要求
rules: |
  - 强调实用、可直接复制粘贴的代码示例。
  - 尽可能避免使用行话，但要保持技术准确性。

# 目标受众：描述您的具体目标受众及其特征
targetAudience: |
  主要受众是希望将 DocSmith 集成到其工作流程中的开发人员。次要受众是希望了解该工具功能的非技术用户。

# 术语表：定义项目特定的术语和定义
# glossary: "@glossary.md"

# 语言和路径设置
locale: en
translateLanguages:
  - zh
  - ja
docsDir: .aigne/doc-smith/docs  # 保存生成文档的目录
sourcesPath:  # 需要分析的源代码路径
  - ./src
  - README.md
```

## 关键配置参数

### 文档策略

这组设置定义了 AI 的高层策略，用于指导其语调、风格和内容重点。

#### `documentPurpose`
指定您希望读者实现的主要目标。您可以选择多个目的。

| 选项 | 名称 | 描述 |
|---|---|---|
| `getStarted` | 快速入门 | 帮助新用户在 30 分钟内从零开始上手。 |
| `completeTasks` | 完成特定任务 | 引导用户完成常见的工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考。 |
| `understandSystem` | 理解系统 | 解释其工作原理以及做出设计决策的原因。 |
| `solveProblems` | 解决常见问题 | 帮助用户排查和修复问题。 |
| `mixedPurpose` | 满足多种目的 | 涵盖多种需求的综合性文档。 |

#### `targetAudienceTypes`
定义最常阅读文档的受众。这会影响写作风格和示例。

| 选项 | 名称 | 描述 |
|---|---|---|
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编写代码的人员。 |
| `developers` | 开发人员 | 将此项目添加到其工程中的工程师。 |
| `devops` | DevOps / SRE | 负责部署、监控和维护系统的团队。 |
| `decisionMakers` | 技术决策者 | 评估实施方案的架构师或负责人。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员。 |
| `mixedTechnical` | 混合技术受众 | 开发人员、DevOps 和其他技术用户。 |

#### `readerKnowledgeLevel`
描述读者的典型初始知识水平。

| 选项 | 名称 | 描述 |
|---|---|---|
| `completeBeginners` | 完全的初学者 | 完全不熟悉该领域/技术。 |
| `domainFamiliar` | 熟悉领域 | 了解问题领域，但对这个具体解决方案不熟悉。 |
| `experiencedUsers` | 经验丰富的用户 | 需要参考或高级主题的常规用户。 |
| `emergencyTroubleshooting` | 紧急/故障排查 | 出现问题，需要快速修复。 |
| `exploringEvaluating` | 正在评估此工具 | 试图了解这是否符合他们的需求。 |

#### `documentationDepth`
控制文档的详尽程度。

| 选项 | 名称 | 描述 |
|---|---|---|
| `essentialOnly` | 仅含基本内容 | 涵盖 80% 的用例，保持简洁。 |
| `balancedCoverage` | 均衡覆盖 | 具有良好深度和实用示例（推荐）。 |
| `comprehensive` | 全面详尽 | 涵盖所有功能、边缘情况和高级场景。 |
| `aiDecide` | 由 AI 决定 | 分析代码复杂度以建议合适的深度。 |

### 自定义与微调

- **`rules`**：一个多行字符串，您可以在其中为 AI 提供自定义的持久指令。这对于定义标准选项未涵盖的特定格式规则、内容要求或所需基调非常有用。
- **`targetAudience`**：一个多行字符串，用于提供更详细的目标受众自由文本描述，以补充 `targetAudienceTypes` 的选择。
- **`glossary`**：包含术语表的 Markdown 文件的路径。这有助于 AI 在所有文档和翻译中一致地使用项目特定的术语。

### 路径和语言

- **`locale`**：文档的主要语言（例如 `en`、`zh`）。
- **`translateLanguages`**：要将文档翻译成的语言代码列表。
- **`docsDir`**：保存生成的文档文件的输出目录。
- **`sourcesPath`**：供 AI 分析的源代码路径或 glob 模式列表。如果留空，则默认为整个项目 (`./`)。

---

## 深入了解

有关特定配置区域的更多详细信息，请浏览以下部分：

<x-cards data-columns="3">
  <x-card data-title="交互式设置" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    了解引导式设置向导如何帮助您配置项目并智能检测冲突的设置。
  </x-card>
  <x-card data-title="LLM 设置" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    了解如何连接不同的 AI 模型，包括在无需您自己的 API 密钥的情况下使用 AIGNE Hub。
  </x-card>
  <x-card data-title="语言支持" data-icon="lucide:languages" data-href="/configuration/language-support">
    查看支持的语言完整列表，并了解如何为您的项目启用自动翻译。
  </x-card>
</x-cards>

配置好您的项目后，您就可以 [生成您的第一套文档](./features-generate-documentation.md) 了。
