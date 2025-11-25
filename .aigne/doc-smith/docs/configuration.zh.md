# 配置参考

`config.yaml` 文件是您文档生成的核心控制面板。通过调整其中的设置，您可以控制 AI 如何生成文档，包括文档结构、内容风格和语言支持等。本指南提供了每个配置字段的详细说明，帮助您根据项目需求进行精确调整。

## 概览

`config.yaml` 文件是 AIGNE DocSmith 的主要配置文件。它使用 YAML 格式存储所有配置参数。当您运行 `create`、`update` 或 `translate` 等命令时，DocSmith 会读取此文件来了解您的配置需求。

- **文件名：** `config.yaml`
- **位置：** `.aigne/doc-smith/config.yaml`（相对于您的项目根目录）
- **格式：** YAML (UTF-8)

通过此文件，您可以设置文档的目标、目标读者、内容生成规则、文档结构、多语言支持和发布设置。

### 创建和更新配置

`config.yaml` 文件在您首次使用 DocSmith 时自动创建。

**创建：**

您可以通过两种方式创建该文件：

1. **在首次生成期间：** 在新项目中运行 `aigne doc create` 将启动一个交互式向导来创建 `config.yaml` 文件，然后再开始生成过程。
2. **单独创建：** 运行 `aigne doc init` 会启动相同的向导来创建配置文件，而不会立即生成文档。

```sh aigne doc init icon=lucide:terminal
aigne doc init
```

**更新：**

您可以使用以下两种方法之一更新您的配置：

1. **直接编辑文件：** 在文本编辑器中打开 `.aigne/doc-smith/config.yaml` 并修改字段。
2. **使用交互式向导：** 再次运行 `aigne doc init`。向导将加载您现有的设置并引导您进行更新。

## 配置参数

`config.yaml` 中的字段按功能组进行组织。以下各节详细解释了每个参数。

### 项目基础

这些字段定义项目的基本信息，用于文档的品牌展示、搜索引擎优化和社交媒体分享。

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>项目的显示名称，会出现在文档标题、导航栏等位置。建议保持在 50 个字符以内，确保在各种界面中都能完整显示。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>项目的简要描述，用于搜索引擎优化和社交分享时的预览文本。建议长度在 150 个字符以内，简洁明了地说明项目的核心价值。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>项目徽标的 URL 或本地文件路径。徽标会显示在文档网站页眉、浏览器标签页图标和社交媒体分享预览中。支持完整 URL（如 `https://example.com/logo.png`）或相对路径（如 `./assets/logo.png`）。</x-field-desc>
  </x-field>
</x-field-group>

### AI 推理配置

这些设置控制 AI 在生成文档内容时的思考深度和处理强度，影响生成质量和速度的平衡。

<x-field-group>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>配置 AI 的推理强度。</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>控制 AI 的思考强度。可选值：`lite`（快速模式，适合简单文档）、`standard`（标准模式，推荐用于大多数场景）、`pro`（深度模式，适合复杂文档，但生成时间更长）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 文档策略

这些设置定义文档的生成策略，包括文档目标、读者类型、内容深度等，直接影响 AI 如何组织和生成内容。

<x-field-group>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>定义文档的主要目标，可多选。选项包括：`getStarted`（快速入门指南）、`completeTasks`（任务操作手册）、`findAnswers`（参考查询手册）、`understandSystem`（系统理解文档）、`solveProblems`（问题排查指南）和 `mixedPurpose`（综合文档）。选择不同的目标会影响文档的结构和内容组织方式。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>指定目标读者类型，可多选。选项包括：`endUsers`（普通用户）、`developers`（开发人员）、`devops`（运维工程师）、`decisionMakers`（技术决策者）、`supportTeams`（技术支持团队）和 `mixedTechnical`（混合技术背景）。选择不同的读者类型会影响文档的语言风格、技术深度和示例类型。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>设定目标读者的技术知识水平。选项包括：`completeBeginners`（完全新手，需要详细解释）、`domainFamiliar`（熟悉相关领域但首次使用此工具）、`experiencedUsers`（有经验的用户，需要参考手册）、`emergencyTroubleshooting`（紧急排查问题，需要快速解决方案）和 `exploringEvaluating`（正在评估是否适合，需要快速了解）。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>控制文档的详细程度。选项包括：`essentialOnly`（仅核心功能，简洁版）、`balancedCoverage`（平衡覆盖，推荐用于大多数项目）、`comprehensive`（全面覆盖，包含所有功能和边界情况）和 `aiDecide`（由 AI 根据代码复杂度自动决定）。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudience" data-type="string" data-required="false">
    <x-field-desc markdown>对目标读者的详细描述，用于补充 `targetAudienceTypes` 的设置。可以描述读者的具体背景、使用场景、技术栈或特殊需求。支持多行文本，帮助 AI 更好地理解读者需求。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>为 AI 提供详细的生成规则和指导，包括内容结构、写作风格、格式要求等。这是最重要的配置字段之一，直接影响生成文档的质量和风格。支持 Markdown 格式，可以编写多行规则。建议详细说明您的具体需求，例如："避免使用模糊词汇"、"必须包含代码示例"等。</x-field-desc>
  </x-field>
</x-field-group>

### 语言

配置主要语言和任何用于翻译的附加语言。

<x-field-group>
  <x-field data-name="locale" data-type="string" data-default="en" data-required="false">
    <x-field-desc markdown>文档的主要语言，使用标准语言代码。常用值包括：`en`（英语）、`zh`（简体中文）、`zh-TW`（繁体中文）、`ja`（日语）等。文档将首先用此语言生成，然后可以翻译到其他语言。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>需要翻译的目标语言列表，可多选。每个语言代码都会生成一套完整的翻译文档。例如，设置 `["zh", "ja"]` 会生成简体中文和日语两个版本的文档。注意：不要包含与 `locale` 相同的语言代码。</x-field-desc>
  </x-field>
</x-field-group>

### 数据源

这些设置指定 AI 分析源代码和文档时使用的参考材料，直接影响生成文档的质量和准确性。

<x-field-group>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>供 AI 分析的源代码和文档路径列表。**这是最重要的配置字段**，因为 AI 只会基于这些路径中的内容生成文档。建议包含：README 文件、主要源代码目录、配置文件（如 `package.json`、`aigne.yaml`）、现有文档目录等。支持多种格式：目录路径（如 `./src`）、文件路径（如 `./README.md`）、glob 模式（如 `src/**/*.js`）和远程 URL。</x-field-desc>
  </x-field>
</x-field-group>

### 输出与部署

配置生成文档的保存位置和发布地址。

<x-field-group>
  <x-field data-name="docsDir" data-type="string" data-default="./aigne/doc-smith/docs" data-required="false">
    <x-field-desc markdown>生成文档的保存目录。所有生成的 Markdown 文件都会保存在此目录中。如果目录不存在，DocSmith 会自动创建。建议使用相对路径，便于项目迁移。</x-field-desc>
  </x-field>
  <x-field data-name="appUrl" data-type="string" data-required="false">
    <x-field-desc markdown>文档发布后的访问地址。运行 `publish` 命令后，DocSmith 会自动更新此字段。通常不需要手动设置，除非您要指定特定的发布地址。</x-field-desc>
  </x-field>
</x-field-group>

### 媒体与显示

这些设置控制如何处理图片等媒体资源。

<x-field-group>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>媒体文件处理设置。</x-field-desc>
      <x-field data-name="minImageWidth" data-type="integer" data-default="800" data-required="false">
      <x-field-desc markdown>图片被纳入文档的最小宽度（单位：像素）。只有宽度大于此值的图片才会被使用，有助于过滤低质量或过小的图片。建议值：600-800 像素（平衡质量与数量），800-1000 像素（高质量要求）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 图表配置

控制图表生成行为和 AI 努力程度。

<x-field-group>
  <x-field data-name="diagramming" data-type="object" data-required="false">
    <x-field-desc markdown>图表生成配置。</x-field-desc>
      <x-field data-name="effort" data-type="integer" data-default="5" data-required="false">
      <x-field-desc markdown>AI 生成图表时的努力程度，范围 0-10。数值越大，生成的图表越少。建议设置：0-3（生成大量图表，适合需要丰富视觉说明的文档）、4-6（平衡模式，推荐）、7-10（生成少量图表，更注重文本内容）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 系统管理字段

这些字段由 DocSmith 自动管理，通常不需要手动编辑。修改这些字段可能导致意外问题。

<x-field-group>
  <x-field data-name="lastGitHead" data-type="string" data-required="false">
    <x-field-desc markdown>上次生成文档时的 Git 提交哈希值。DocSmith 使用此值来判断哪些文件已更改，从而实现增量更新。**请勿手动修改**。</x-field-desc>
  </x-field>
  <x-field data-name="boardId" data-type="string" data-required="false">
    <x-field-desc markdown>文档发布板的唯一标识符，由系统自动生成。**请勿手动修改**，否则会导致项目与发布历史断开连接，可能丢失已发布的文档。</x-field-desc>
  </x-field>
  <x-field data-name="checkoutId" data-type="string" data-required="false">
    <x-field-desc markdown>文档部署过程中使用的临时标识符，由系统自动管理。**请勿手动修改**。</x-field-desc>
  </x-field>
  <x-field data-name="shouldSyncBranding" data-type="string" data-required="false">
    <x-field-desc markdown>控制是否同步品牌标识的临时变量，由系统自动管理。**请勿手动修改**。</x-field-desc>
  </x-field>
</x-field-group>

## 应用更改

修改 `config.yaml` 文件后，需要运行相应的命令才能使更改生效。不同的字段需要不同的命令，具体如下表所示。

| 字段 | 应用更改的命令 | 说明 |
| :-------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------ |
| `documentPurpose`, `targetAudienceTypes`, `readerKnowledgeLevel`, `documentationDepth`, `locale` | `aigne doc clear && aigne doc create` | 这些字段影响文档的整体结构，需要清除旧文档并重新生成。 |
| `rules`, `targetAudience`, `media.minImageWidth`, `thinking.effort`, `diagramming.effort` | `aigne doc update` | 这些字段只影响内容生成方式，可以直接更新现有文档，无需重新生成。 |
| `sourcesPath` | `aigne doc clear && aigne doc create` 或 `aigne doc update` | 添加新的数据源后，可以选择完全重新生成或增量更新。建议首次添加时使用 `create`，后续添加使用 `update`。 |
| `translateLanguages` | `aigne doc translate` | 添加新的翻译语言后，运行此命令生成对应语言的文档版本。 |
| `projectName`, `projectDesc`, `projectLogo`, `appUrl` | `aigne doc publish` | 这些字段主要用于发布时的元数据，修改后重新发布即可生效。 |
| `docsDir` | `aigne doc create` | 修改输出目录后，下次生成文档时会保存到新目录。 |

## 完整配置示例

以下是 AIGNE DocSmith 项目本身的完整 `config.yaml` 文件，展示了一个真实世界的配置。

```yaml config.yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation creation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: comprehensive

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: .aigne/doc-smith/docs
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml
  - ./assets/screenshots
lastGitHead: d9d2584f23aee352485f369f60142949db601283
# ⚠️ Warning: boardId is auto-generated by system, please do not edit manually
boardId: "docsmith"
appUrl: https://docsmith.aigne.io
# Checkout ID for document deployment service
checkoutId: ""

diagramming:
  effort: 5 # AI effort level for diagramming, 0-10, large is less diagram
# AI Thinking Configuration
# thinking.effort: Determines the depth of reasoning and cognitive effort the AI uses when responding, available options:
#   - lite: Fast responses with basic reasoning
#   - standard: Balanced speed and reasoning capability
#   - pro: In-depth reasoning with longer response times
thinking:
  effort: standard
# Should sync branding for documentation
shouldSyncBranding: ""
```

## 总结

`config.yaml` 文件是控制文档生成的核心。通过合理配置项目信息、文档策略和数据源，您可以引导 AI 生成符合项目需求的高质量文档。建议从基础配置开始，逐步根据实际效果调整各项参数。
