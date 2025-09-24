# LLM 设置

AIGNE DocSmith 使用大语言模型 (LLMs) 生成文档内容。您可以通过两种方式配置 AI 模型提供商：使用集成的 AIGNE Hub，或连接您自己的自定义 API 密钥。

## AIGNE Hub (推荐)

最直接的入门方式是使用 AIGNE Hub。它充当多个 LLM 提供商的网关，提供两大主要优势：

- **无需 API 密钥：** 您无需管理自己的 API 密钥或服务订阅即可生成文档。
- **轻松切换模型：** 您可以使用 `--model` 标志为任何命令更改 AI 模型。

要通过 AIGNE Hub 使用特定模型，请在命令中添加 `--model` 标志。以下是一些示例：

```bash 通过 AIGNE Hub 使用不同模型 icon=mdi:code-braces
# 使用 Google 的 Gemini 2.5 Flash 模型
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 模型
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 模型
aigne doc generate --model openai:gpt-4o
```

如果您未指定模型，DocSmith 将使用您项目配置中定义的默认模型。

## 使用自定义 API 密钥

如果您更喜欢使用自己在 OpenAI 或 Anthropic 等提供商处的账户，可以用您的个人 API 密钥配置 DocSmith。这种方法让您可以直接控制 API 的使用和计费。

配置通过一个交互式向导进行。要启动它，请运行以下命令：

```bash
aigne doc init
```

该向导将提示您选择提供商并输入凭据。有关完整指南，请参阅 [交互式设置](./configuration-interactive-setup.md) 文档。

## 设置默认模型

为了在所有文档生成任务中保持一致性，您可以在项目的 `aigne.yaml` 配置文件中设置一个默认 LLM。任何不包含 `--model` 标志的命令都将使用此模型。

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此示例中，DocSmith 被配置为默认使用 Google 的 `gemini-2.5-pro` 模型，并将 `temperature` 设置为 `0.8`。

---

配置好您的 LLM 提供商后，您就可以管理文档的语言设置了。请继续阅读 [语言支持](./configuration-language-support.md) 指南，以查看支持语言的完整列表并了解如何启用它们。