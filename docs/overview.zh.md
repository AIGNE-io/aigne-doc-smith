# 概述

AIGNE DocSmith 是一款利用人工智能从项目源代码自动创建文档的工具。它基于 [AIGNE Framework](https://www.aigne.io/en/framework) 构建，旨在生成能够准确反映代码库的结构化、多语言文档。

DocSmith 的主要目标是解决手动编写文档时常见的挑战，例如耗时、代码变更后文档过时以及缺乏一致性。通过自动化此过程，DocSmith 有助于确保您的文档保持最新和准确。

## 工作原理

DocSmith 通过分析项目的源代码来理解其结构、组件和功能。基于此分析，它会生成一套完整的文档，从高级指南到详细的 API 参考手册。

```d2
direction: down

Source-Code: {
  label: "项目源代码"
  shape: rectangle
}

DocSmith: {
  label: "AIGNE DocSmith\n（AI 分析引擎）"
  shape: rectangle
}

Docs: {
  label: "生成的文档"
  shape: rectangle
}

Source-Code -> DocSmith: "分析"
DocSmith -> Docs: "生成"
```

## 核心功能

DocSmith 提供了一套功能来处理从创建到发布的整个文档生命周期。

*   **AI 驱动生成**：分析您的代码库，提出符合逻辑的文档结构，并生成解释代码功能的内容。
*   **多语言支持**：将文档翻译成 12 种语言，包括英语、中文（简体）和日语。翻译过程具备上下文感知能力，以保持技术准确性。
*   **与 LLM 集成**：可连接各种大型语言模型 (LLM)。默认情况下，它使用 [AIGNE Hub](https://www.aigne.io/en/hub)，该服务允许您在 Google Gemini 和 OpenAI GPT 等模型之间切换，而无需单独的 API 密钥。您也可以配置自己的 API 密钥以直接访问提供商。
*   **智能更新**：检测源代码中的变更，并更新文档的相应部分。您还可以提供具体反馈以优化生成的内容。
*   **发布选项**：通过单个命令发布您生成的文档。您可以将其部署到官方 DocSmith 平台，也可以运行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 实例。Discuss Kit 是一项用于托管和展示文档的服务。

## 可用命令

DocSmith 通过一组命令进行操作。下表总结了主要命令及其功能。

| 命令 | 描述 |
| :--- | :--- |
| `generate` | 从源文件创建一套新的文档。 |
| `update` | 根据代码变更或新反馈修改现有文档。 |
| `translate` | 将文档翻译成 12 种支持的语言中的一种或多种。 |
| `publish` | 将您的文档部署到一个实时的、可访问的 URL。 |
| `evaluate` | 评估所生成文档的质量和完整性。 |
| `history` | 查看对文档所做更新的历史记录。 |
| `clear` | 删除生成的文件、配置和缓存数据。 |
| `prefs` | 管理用于文档生成的已保存首选项和配置。 |

---

本概述简要介绍了 AIGNE DocSmith 的用途和功能。要开始使用该工具，请参阅 [快速入门](./getting-started.md) 指南以获取安装和设置说明。