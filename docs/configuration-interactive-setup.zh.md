# 交互式设置

为了简化项目配置，AIGNE DocSmith 提供了一个交互式设置向导，通过 `aigne doc init` 命令启动。这个引导式流程会询问一系列关于您文档目标的问题，并生成一个根据您需求量身定制的 `config.yaml` 文件。这是开始新文档项目的推荐方式，因为它有助于防止配置错误并提供智能建议。

## 运行向导

首先，在您项目的根目录中运行以下命令：

```bash
npx aigne doc init
```

然后，该向导将引导您完成一个 8 步流程来配置您的文档。

## 引导式流程

该向导涵盖以下关键领域：

1.  **主要目标**：定义读者的主要成果（例如，快速入门、快速找到答案）。
2.  **目标受众**：明确文档的阅读对象（例如，非技术最终用户、开发人员）。
3.  **读者知识水平**：评估受众的典型初始知识水平。
4.  **文档深度**：决定内容的全面程度。
5.  **主要语言**：设置文档的主要语言。
6.  **翻译语言**：选择用于翻译的其他语言。
7.  **输出目录**：指定生成文档文件的保存位置。
8.  **源代码路径**：定义要分析的文件和目录，支持 glob 模式。

## 智能辅助

交互式向导不仅仅是一个简单的表单。它内置了逻辑，帮助您创建更有效、更连贯的配置。

```d2
direction: down

User-Selections: {
  label: "1. 用户提供输入\n（目的、受众等）"
  shape: rectangle
}

Wizard-Intelligence: {
  label: "2. 向导的智能引擎"
  shape: package
  grid-columns: 2

  Filtering: {
    label: "选项筛选\n（防止无效组合）"
  }

  Conflict-Detection: {
    label: "冲突检测\n（识别复杂需求）"
  }
}

Guided-Experience: {
  label: "3. 引导式体验"
  shape: rectangle
  content: "用户看到简化、相关的选项"
}

Final-Config: {
  label: "4. 最终配置"
  shape: document
  content: "生成包含\n冲突解决策略的 config.yaml"
}

User-Selections -> Wizard-Intelligence
Wizard-Intelligence.Filtering -> Guided-Experience
Wizard-Intelligence.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "优化"
```

### 智能默认值和选项筛选

在您回答问题的过程中，向导会提供智能默认值并筛选后续选项，以引导您进行逻辑配置。例如：

-   **默认建议**：如果您选择“快速入门”作为主要目标，向导将推荐“完全是初学者”作为读者的知识水平。
-   **实时筛选**：如果您的目标受众是“最终用户（非技术人员）”，向导将隐藏“试图做特定事情的专家”等技术性较高的知识水平选项，以防止不兼容的选择。

### 冲突检测与解决

有时，您可能会有多个看似冲突的目标或受众，例如同时为非技术的**最终用户**和专业的**开发人员**创建文档。DocSmith 的向导不会将其视为错误，而是将这些识别为“可解决的冲突”。

然后，它会制定一个策略，在文档结构中满足这些多样化的需求。对于最终用户与开发人员的例子，解决方案是创建独立的用户路径：

-   **用户指南路径**：使用简单的语言，侧重于 UI 交互，并面向业务成果。
-   **开发者指南路径**：代码优先，技术上精确，并包含 SDK 示例和配置片段。

这种方法确保最终的文档结构能够智能地为多个受众提供有效服务，而不是创建一种令人困惑的内容混合体。

## 生成的输出

完成后，向导会在您的项目中保存一个 `config.yaml` 文件。该文件带有完整的注释，解释了每个选项并列出了所有可用选择，便于以后手动审查和修改。

以下是生成文件的片段示例：

```yaml
# 用于文档发布的项目信息
projectName: your-project-name
projectDesc: Your project description.
projectLogo: ""

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者实现的主要成果是什么？
# 可用选项（根据需要取消注释并修改）：
#   getStarted       - 快速入门：帮助新用户在 30 分钟内从零到上手
#   completeTasks    - 完成特定任务：引导用户完成常见的工作流程和用例
documentPurpose:
  - completeTasks
  - findAnswers

# 目标受众：谁会最常阅读本文档？
# 可用选项（根据需要取消注释并修改）：
#   endUsers         - 最终用户（非技术人员）：使用产品但不编写代码的人
#   developers       - 开发人员（集成您的产品/API）：将此产品添加到其项目中的工程师
targetAudienceTypes:
  - endUsers
  - developers

# ... other settings
```

## 后续步骤

配置文件就绪后，您就可以生成、翻译或发布您的文档了。

<x-cards>
  <x-card data-title="生成文档" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    了解如何使用单个命令从源代码自动创建一套完整的文档。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    深入了解所有可用设置，并学习如何手动微调 config.yaml 文件。
  </x-card>
</x-cards>