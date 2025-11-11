# 概述

是否在努力让您的文档与不断变化的代码库保持同步？AIGNE DocSmith 可将整个过程自动化，通过分析您的源代码生成准确、结构化且支持多语言的文档，让您能专注于构建卓越的软件。

AIGNE DocSmith 是一款 AI 驱动的工具，可从您的项目源代码中自动创建文档。它基于 [AIGNE Framework](https://www.aigne.io/en/framework) 构建，旨在生成能够准确反映您代码库的结构化、多语言文档。

该工具解决了手动编写文档时常见的挑战，例如创建过程耗时、代码演进后文档迅速过时以及不同章节之间缺乏一致性等问题。通过自动化此过程，DocSmith 有助于确保您的文档保持最新、准确和实用。

## 工作原理

DocSmith 通过分析您项目的源代码来理解其结构、组件和功能。基于此分析，它会生成一套完整的文档，从高级指南到详细的 API 参考都涵盖在内。

```d2
direction: down

Source-Code: {
  label: "源代码"
  shape: rectangle
}

AIGNE-DocSmith: {
  label: "AIGNE DocSmith"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Analysis-Engine: {
    label: "分析引擎"
    shape: rectangle
  }

  Generation-Engine: {
    label: "生成引擎"
    shape: rectangle
  }

  Translation-Engine: {
    label: "翻译引擎"
    shape: rectangle
  }

  LLMs: {
    label: "大语言模型"
    shape: rectangle

    AIGNE-Hub: {
      label: "AIGNE Hub"
    }

    Direct-Access: {
      label: "直接访问"
      shape: rectangle
      Google-Gemini: {}
      OpenAI-GPT: {}
    }
  }
}

Published-Documentation: {
  label: "已发布的文档"
  shape: rectangle

  DocSmith-Platform: {
    label: "DocSmith 平台"
  }

  Discuss-Kit: {
    label: "Discuss Kit"
  }
}

Source-Code -> AIGNE-DocSmith.Analysis-Engine: "分析"
AIGNE-DocSmith.Analysis-Engine -> AIGNE-DocSmith.Generation-Engine: "生成"
AIGNE-DocSmith.Generation-Engine <-> AIGNE-DocSmith.LLMs: "利用"
AIGNE-DocSmith.Generation-Engine -> AIGNE-DocSmith.Translation-Engine: "翻译"
AIGNE-DocSmith.Translation-Engine -> Published-Documentation: "发布"

```

## 核心功能

DocSmith 提供了一系列功能来处理从创建到发布的整个文档生命周期。

*   **AI 驱动生成**：分析您的代码库，提出逻辑化的文档结构，并生成解释代码功能的内容。
*   **多语言支持**：将文档翻译成 12 种语言，包括英语、中文（简体）和日语。翻译过程具备上下文感知能力，以保持技术准确性。
*   **与大语言模型（LLM）集成**：连接各种大语言模型（LLM）。默认情况下，它使用 [AIGNE Hub](https://www.aigne.io/en/hub)，该服务允许您在 Google Gemini 和 OpenAI GPT 等模型之间切换，无需单独的 API 密钥。您也可以配置自己的 API 密钥以直接访问提供商。
*   **智能更新**：检测源代码中的更改并更新文档的相应部分。您还可以提供具体反馈以优化生成的内容。
*   **发布选项**：只需一个命令即可发布您生成的文档。您可以部署到官方的 DocSmith 平台，或运行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 实例。Discuss Kit 是一项用于托管和展示文档的服务。

## 可用命令

DocSmith 通过命令行界面进行操作。下表总结了主要命令及其功能。

| Command | Description |
| :--- | :--- |
| `generate` | 从您的源文件创建一套新文档。 |
| `update` | 根据代码更改或新反馈修改现有文档。 |
| `translate` | 将文档翻译成 12 种支持的语言中的一种或多种。 |
| `publish` | 将您的文档部署到一个可公开访问的 URL。 |
| `evaluate` | 评估您生成文档的质量和完整性。 |
| `history` | 查看对您的文档所做更新的历史记录。 |
| `chat` | 启动一个交互式聊天会话来生成和管理文档。 |
| `clear` | 移除生成的文件、配置和缓存数据。 |
| `init` | 通过交互式流程引导您创建一个初始配置文件。 |
| `prefs` | 管理用于文档生成的已保存偏好设置和配置。 |

---

本概述总结了 AIGNE DocSmith 的用途和功能。要开始使用该工具，请转到[入门指南](./getting-started.md)查看安装和设置说明。