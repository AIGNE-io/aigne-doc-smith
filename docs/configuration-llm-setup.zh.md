---
labels: ["Reference"]
---

# LLM 设置

DocSmith 旨在与各种大型语言模型 (LLMs) 协作，以生成您的文档内容。您可以灵活选择最适合您需求的模型。配置主要有两种方式：使用集成的 AIGNE Hub 服务，或提供您自己的自定义 API 密钥。

## 使用 AIGNE Hub (推荐)

通过 AIGNE Hub 连接 LLM 是最简单且推荐的方法。这种方法具有显著优势：

- **无需 API 密钥：** 您无需注册独立的 AI 服务或管理自己的 API 密钥。
- **轻松切换模型：** 您可以直接通过命令行轻松切换来自主流提供商的不同 LLM，从而进行实验，为您的项目找到最佳模型。

如需指定 AIGNE Hub 中的模型，请在 `generate` 命令中使用 `--model` 标志。

### 示例

以下是使用 AIGNE Hub 提供的不同模型生成文档的一些示例：

```bash
# 使用 Google 的 Gemini 2.5 Flash
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o
aigne doc generate --model openai:gpt-4o
```


## 使用自定义 API 密钥

如果您希望为 OpenAI、Anthropic 等服务使用自己的 API 密钥，可以在设置过程中进行配置。当您运行交互式配置向导时，DocSmith 会提示您输入 API 密钥。

如需使用自定义密钥设置或修改您的 LLM 提供商设置，请运行 `init` 命令：

```bash
aigne doc init
```

该命令将引导您完成所有必要的配置步骤，包括选择您的 LLM 提供商并输入相应的 API 密钥。有关设置向导的更多详细信息，请参阅[配置指南](./configuration.md)。
