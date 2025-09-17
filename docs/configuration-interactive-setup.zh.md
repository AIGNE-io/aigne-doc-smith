# 交互式设置

AIGNE DocSmith 包含一个交互式设置向导，通过 `aigne doc init` 命令启动，以简化项目配置。该引导过程会询问一系列关于你的文档目标的问题，并根据你的回答生成一个 `config.yaml` 文件。这是启动新文档项目的推荐方法，因为它有助于防止配置错误，并根据你的输入提供具体建议。

## 运行向导

要开始此过程，请在项目的根目录中运行以下命令：

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

然后，向导将引导你完成一个 8 步流程来配置文档。

## 引导流程

向导会提示输入以下关键配置细节：

1.  **主要目标**：定义读者的主要目的（例如，入门、寻找答案）。
2.  **目标受众**：指明文档的主要读者（例如，非技术最终用户、开发者）。
3.  **读者知识水平**：评估受众的典型初始知识水平。
4.  **文档深度**：确定内容的详细程度和范围。
5.  **主要语言**：设置文档的主要语言。
6.  **翻译语言**：选择其他需要翻译的语言。
7.  **输出目录**：指定生成文档文件的位置。
8.  **源代码路径**：定义要分析的文件和目录，支持 glob 模式。

## 辅助配置

向导使用一套预定义规则来帮助你创建一致且有效的配置。

```d2
direction: down

User-Selections: {
  label: "1. 用户提供输入\n（目的、受众等）"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. 向导的规则引擎"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "选项筛选\n（防止不兼容的选择）"
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
  content: "config.yaml 生成时\n包含冲突解决策略"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "完善"
```

### 默认建议和选项筛选

在你进行选择时，向导会提供默认值并筛选后续选项，以引导你进行逻辑配置。这是基于一套跨问题冲突规则。

-   **默认建议**：如果你选择“快速入门”作为主要目标，向导将推荐“完全是初学者”作为读者的知识水平。
-   **实时筛选**：如果你的目标受众是“最终用户（非技术人员）”，向导将隐藏“是专家”这一知识水平选项。该规则的理由是，非技术用户通常不是经验丰富的技术用户，从而防止不兼容的选择。

### 冲突检测与解决

在某些情况下，你可能有多个目标或受众，需要特定的文档结构才能有效，例如为非技术的 **最终用户** 和专业的 **开发者** 创建文档。向导将这些识别为“可解决的冲突”。

然后，它会制定一个策略来解决文档结构中的这些需求。对于最终用户与开发者的例子，解决策略是创建独立的用户路径：

-   **用户指南路径**：使用通俗易懂的语言，侧重于 UI 交互，并以业务成果为导向。
-   **开发者指南路径**：代码优先，技术上精确，并包含 SDK 示例和配置片段。

这种方法确保最终的文档结构能够有效地服务于多个受众，而不是创建一个单一、混乱的内容混合体。

## 生成输出

完成向导后，它会在你的项目中保存一个 `config.yaml` 文件。该文件带有完整的注释，解释了每个选项并列出了所有可用选择，这使得以后手动审查和修改变得容易。

以下是生成文件的片段：

```yaml config.yaml icon=logos:yaml
# 用于文档发布的项目信息
projectName: your-project-name
projectDesc: 你的项目描述。
projectLogo: ""

# =============================================================================
# 文档配置
# =============================================================================

# 目的：你希望读者实现的主要成果是什么？
# 可用选项（根据需要取消注释并修改）：
#   getStarted       - 快速入门：帮助新用户在 30 分钟内从零开始上手
#   completeTasks    - 完成特定任务：引导用户了解常见工作流程和用例
documentPurpose:
  - completeTasks
  - findAnswers

# 目标受众：谁会最常阅读本文档？
# 可用选项（根据需要取消注释并修改）：
#   endUsers         - 最终用户（非技术人员）：使用产品但不编写代码的人
#   developers       - 集成你的产品/API 的开发者：将此产品添加到其项目中的工程师
targetAudienceTypes:
  - endUsers
  - developers

# ... 其他设置
```

## 后续步骤

配置文件就绪后，你就可以生成、翻译或发布文档了。

<x-cards>
  <x-card data-title="生成文档" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    了解如何使用单个命令从源代码自动创建一套完整的文档。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    深入了解所有可用设置，并学习如何手动微调 config.yaml 文件。
  </x-card>
</x-cards>