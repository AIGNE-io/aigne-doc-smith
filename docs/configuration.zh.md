---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 的行为由一个强大的配置文件 `config.yaml` 控制。该文件位于项目的 `.aigne/doc-smith` 目录中，你可以通过它自定义文档生成过程的各个方面，从目标受众、风格到语言支持和文件结构。

本指南为所有可用设置提供了详细的参考。虽然你可以随时手动编辑此文件，但我们建议使用 [交互式设置](./configuration-interactive-setup.md) 向导来完成初始配置。

## 配置概览

DocSmith 提供灵活的配置系统，以满足你项目的独特需求。你可以定义文档的目标、指定受众、设置 AI 模型以及管理多种语言。请在下方探索主要的配置领域。

<x-cards data-columns="2">
  <x-card data-title="交互式设置" data-href="/configuration/interactive-setup" data-icon="lucide:wand-2">
    了解如何使用 `aigne doc init` 命令运行引导式向导，轻松创建初始配置文件。
  </x-card>
  <x-card data-title="LLM 设置" data-href="/configuration/llm-setup" data-icon="lucide:brain-circuit">
    配置不同的大语言模型，包括使用集成的 AIGNE Hub 免密钥访问热门模型。
  </x-card>
  <x-card data-title="语言支持" data-href="/configuration/language-support" data-icon="lucide:languages">
    设置你的主要文档语言，并从超过 12 种支持的语言中选择进行自动翻译。
  </x-card>
  <x-card data-title="管理偏好" data-href="/configuration/preferences" data-icon="lucide:sliders-horizontal">
    了解 DocSmith 如何从你的反馈中学习以创建持久化规则，以及如何管理这些规则。
  </x-card>
</x-cards>

## 参数参考

`config.yaml` 文件包含几个关键部分，用于定义文档的生成方式。以下是每个参数的详细说明。

### 项目信息

这些设置用于发布文档时的信息展示。

```yaml
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: 一款 AI 驱动的文档生成工具。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png
```

- `projectName`: 你的项目名称。
- `projectDesc`: 你的项目的简短描述。
- `projectLogo`: 你的项目徽标的 URL。

### 文档风格

这些参数定义了文档的用途、受众和整体基调。

#### `documentPurpose`

定义读者的主要目标。你可以选择多个用途。

| Key | Name | Description |
|---|---|---|
| `getStarted` | 快速入门 | 帮助新用户在 30 分钟内从零开始上手。 |
| `completeTasks` | 完成特定任务 | 引导用户完成常见的工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考。 |
| `understandSystem` | 理解系统 | 解释其工作原理以及做出设计决策的原因。 |
| `solveProblems` | 排查常见问题 | 帮助用户排查和修复问题。 |
| `mixedPurpose` | 满足多种用途 | 涵盖多种需求的综合性文档。 |

**示例：**
```yaml
documentPurpose:
  - getStarted
  - findAnswers
```

#### `targetAudienceTypes`

指定文档的主要受众。

| Key | Name | Description |
|---|---|---|
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编写代码的人员。 |
| `developers` | 集成你的产品/API 的开发者 | 将此产品添加到其项目中的工程师。 |
| `devops` | DevOps / SRE / 基础设施团队 | 负责部署、监控和维护系统的团队。 |
| `decisionMakers` | 技术决策者 | 评估或规划实施方案的架构师和负责人。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员。 |
| `mixedTechnical` | 混合技术受众 | 开发者、DevOps 和技术用户。 |

**示例：**
```yaml
targetAudienceTypes:
  - developers
```

#### `readerKnowledgeLevel`

描述读者的典型初始知识水平。

| Key | Name | Description |
|---|---|---|
| `completeBeginners` | 完全的初学者，从零开始 | 完全不了解该领域/技术。 |
| `domainFamiliar` | 以前使用过类似的工具 | 了解问题领域，但对这个具体解决方案不熟悉。 |
| `experiencedUsers` | 试图做特定事情的专家 | 需要参考/高级主题的普通用户。 |
| `emergencyTroubleshooting` | 紧急情况/故障排查 | 出现问题，需要快速修复。 |
| `exploringEvaluating` | 正在评估此工具并与其他工具进行比较 | 试图了解这是否满足他们的需求。 |

**示例：**
```yaml
readerKnowledgeLevel: completeBeginners
```

#### `documentationDepth`

控制文档的全面程度。

| Key | Name | Description |
|---|---|---|
| `essentialOnly` | 仅包含基本内容 | 覆盖 80% 的用例，保持简洁。 |
| `balancedCoverage` | 平衡的覆盖范围 | 具有良好深度和实际示例 [推荐]。 |
| `comprehensive` | 全面 | 覆盖所有功能、边缘情况和高级场景。 |
| `aiDecide` | 让 AI 决定 | 分析代码复杂性并建议适当的深度。 |

**示例：**
```yaml
documentationDepth: balancedCoverage
```

### 自定义规则和描述

这些字段允许你向 AI 提供更具体的指令。

- `rules`: 一个多行字符串，你可以在其中定义具体的生成规则和要求，例如“在教程中始终包含‘先决条件’部分”。
- `targetAudience`: 一个多行字符串，用于比预设选项更详细地描述你的目标受众。

**示例：**
```yaml
rules: |
  - 所有代码示例必须是完整的，并且可以直接复制粘贴。
  - 避免使用未加解释的技术术语。
targetAudience: |
  我们的受众是熟悉 JavaScript 但可能不熟悉后端概念的前端开发者。他们重视清晰、实用的示例。
```

### 语言和路径设置

这些参数用于配置文档的语言和文件位置。

- `locale`: 文档的主要语言（例如 `en`、`zh`）。
- `translateLanguages`: 要将文档翻译成的目标语言代码列表。
- `glossary`: 指向一个 Markdown 文件的路径，该文件包含项目特定术语，以确保翻译的一致性。
- `docsDir`: 用于保存生成的文档的目录。
- `sourcesPath`: 供 AI 分析的源代码路径或 glob 模式列表。

**示例：**
```yaml
# 语言设置
locale: en
translateLanguages:
  - zh
  - ja

# 用于确保术语一致性的词汇表
glossary: "@glossary.md"

# 目录和源路径配置
docsDir: .aigne/doc-smith/docs  # 保存生成文档的目录
sourcesPath:  # 需要分析的源代码路径
  - ./src
  - ./README.md
```

---

根据你的项目定制好 `config.yaml` 文件后，你就可以开始创建文档了。下一步是运行生成命令。

➡️ **下一步：** 学习如何 [生成文档](./features-generate-documentation.md)。