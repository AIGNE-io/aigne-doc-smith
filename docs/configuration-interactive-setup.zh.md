---
labels: ["Reference"]
---

# 交互式设置

`aigne doc init` 命令是一个引导式设置向导，旨在帮助您为文档项目创建一个全面的 `config.yaml` 文件。通过回答一系列问题，您可以快速定义文档的目标、受众和结构。该向导还包含智能冲突检测功能，以防止配置错误，并确保您的设置合乎逻辑且有效。

这是任何新 DocSmith 项目的推荐起点。

## 启动向导

要开始交互式设置过程，请在项目根目录中运行以下命令：

```bash AIGNE DocSmith 初始化 icon=lucide:terminal
aigne doc init
```

这将启动向导，它将引导您逐步完成配置问题。

## 设置过程

该向导会提出一系列八个问题，以根据您的具体需求定制文档生成。它会根据您之前的回答提供智能默认值，以加快流程。

<br/>

```d2 交互式设置流程
direction: down

User: { 
  shape: c4-person 
}

CLI: {
  label: "AIGNE CLI"
  shape: rectangle

  Wizard: {
    label: "交互式向导"
  }

  Detector: {
    label: "冲突检测器"
  }
}

ConfigFile: {
  label: "config.yaml"
  shape: rectangle
}

User -> CLI.Wizard: "1. aigne doc init"
CLI.Wizard <-> User: "2. 提出配置问题"
CLI.Wizard -> CLI.Detector: "3. 验证选择"
CLI.Detector -> CLI.Wizard: "4. 返回过滤后的选项"
CLI.Wizard -> ConfigFile: "5. 生成 config.yaml"
User -> CLI: "6. aigne doc generate"
```

### 逐步提问

1.  **主要目标 (`documentPurpose`):** 您希望读者达成的最主要成果是什么？您的选择将决定文档的整体风格和重点。
2.  **主要受众 (`targetAudienceTypes`):** 谁会最常阅读这份文档？这将影响写作风格、语气和技术深度。
3.  **读者知识水平 (`readerKnowledgeLevel`):** 读者通常具备哪些知识？这有助于将内容调整到合适的起点，从完全的初学者到专家。
4.  **文档深度 (`documentationDepth`):** 文档应达到多大的详尽程度？这控制了文档的范围，从仅涵盖基本用例到详尽介绍每个功能。
5.  **主要语言 (`locale`):** 文档的主要语言是什么？向导将检测您系统的语言作为默认选项。
6.  **翻译语言 (`translateLanguages`):** 您想提供翻译吗？您可以选择要生成的其他语言。
7.  **文档目录 (`docsDir`):** 生成的文档文件应保存在哪里？
8.  **源代码路径 (`sourcesPath`):** 应分析哪些文件和目录来生成文档？您可以提供具体路径或使用 glob 模式（例如，`src/**/*.js`）。

## 智能冲突检测

交互式设置的一个关键特性是它能够识别并帮助解决相互冲突的配置选项。这确保了生成的文档结构连贯一致，并能有效地服务于您的受众。

### 过滤不兼容选项

在您回答问题的过程中，向导会动态过滤后续步骤中的选项，以防止逻辑上的矛盾。例如，如果您选择的主要目标是 **“快速上手”**（针对新用户），向导将从业读者知识水平选项中移除 **“试图完成特定任务的专家”**。系统能理解这两个目标在根本上是不兼容的。

### 解决复杂场景

有时，您可能希望面向多个看似冲突的受众或目标（例如，同时面向非技术的 **最终用户** 和 **开发者**）。向导不会阻止这种选择，而是允许您这样做，并在您的 `config.yaml` 文件中生成具体指南，通过智能的文档结构来解决这种冲突。

例如，如果您同时选择了 `endUsers` 和 `developers`，生成的配置可能会建议您创建独立的用户路径：
- 一份 **用户指南**，使用简单的语言和侧重于用户界面的示例。
- 一份 **开发者指南**，采用代码优先、技术精确的方式，并包含 API 示例。

## 生成的配置文件

回答完所有问题后，向导会将您的选择保存到 `.aigne/doc-smith` 目录下的 `config.yaml` 文件中。该文件附有大量注释，解释了每个选项并列出了所有可用选项，便于日后查阅和修改。

以下是生成的 `config.yaml` 文件片段示例：

```yaml config.yaml icon=logos:yaml
# 用于文档发布的项目信息
projectName: my-awesome-project
projectDesc: 我的出色项目的描述。
projectLogo: ''

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者达成的最主要成果是什么？
# 可用选项（根据需要取消注释并修改）：
#   getStarted       - 快速上手：帮助新用户在 30 分钟内从零开始到正常使用
#   completeTasks    - 完成特定任务：引导用户完成常见工作流和用例
documentPurpose:
  - getStarted

# 目标受众：谁会最常阅读这份文档？
# 可用选项（根据需要取消注释并修改）：
#   endUsers         - 最终用户（非技术人员）：使用产品但不编写代码的人员
#   developers       - 开发者（集成您的产品/API）：将此产品添加到其项目中的工程师
targetAudienceTypes:
  - developers

# ... 其他设置以此类推

# 路径
docsDir: .aigne/doc-smith/docs  # 保存生成文档的目录
sourcesPath:  # 需要分析的源代码路径
  - src/
```

## 后续步骤

配置完成后，您就可以继续下一步了。您可以手动微调设置，也可以直接开始生成文档。

<x-cards data-columns="2">
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    查阅并手动编辑 config.yaml 文件中的所有可用设置。
  </x-card>
  <x-card data-title="生成文档" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    既然您的项目已配置完成，接下来学习如何生成您的第一批文档。
  </x-card>
</x-cards>