# LLM 设置

AIGNE DocSmith 使用大语言模型 (LLM) 生成文档内容。配置 AI 模型提供商主要有两种方法：利用集成的 AIGNE Hub，或连接您选择的提供商的自定义 API 密钥。

## AIGNE Hub (推荐)

配置 LLM 最直接的方法是通过 AIGNE Hub。它作为多个 LLM 提供商的网关，提供两大优势：

- **无需 API 密钥：** 您无需管理自己的 API 密钥或服务订阅即可生成文档。
- **灵活切换模型：** 您可以使用 `--model` 标志为任何命令更改 AI 模型。

要通过 AIGNE Hub 使用特定模型，请在命令后附加 `--model` 标志。以下示例演示了其用法：

```bash 通过 AIGNE Hub 使用不同模型 icon=mdi:code-braces
# 使用 OpenAI 的 GPT-4o 模型
aigne doc generate --model openai:gpt-4o

# 使用 Anthropic 的 Claude 4.5 Sonnet 模型
aigne doc generate --model anthropic:claude-sonnet-4-5

# 使用 Google 的 Gemini 2.5 Pro 模型
aigne doc generate --model google:gemini-2.5-pro
```

如果未指定 `--model` 标志，DocSmith 将默认使用项目配置文件中定义的模型。

## 使用自定义 API 密钥

对于希望使用自己在 OpenAI、Anthropic 或 Google 等提供商处的账户的用户，可以使用个人 API 密钥配置 DocSmith。这种方法可以对 API 使用和计费进行直接控制。

配置通过交互式向导进行。要启动它，请运行以下命令：

```bash 启动交互式向导 icon=lucide:magic-wand
aigne doc init
```

向导将提示您选择提供商并输入必要的凭据。有关此过程的完整分步指南，请参阅[交互式设置](./configuration-interactive-setup.md)文档。

## 设置默认模型

为了在所有文档生成任务中保持一致性，可以在项目的 `aigne.yaml` 配置文件中设置默认的 LLM。任何未明确包含 `--model` 标志的命令都将使用此模型。

以下是配置示例：

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此示例中，DocSmith 配置为使用 Google 的 `gemini-2.5-pro` 模型，并将 `temperature` 设置为 `0.8` 作为所有生成任务的默认值。

---

配置好 LLM 提供商后，下一步是管理文档的语言设置。请前往[语言支持](./configuration-language-support.md)指南，查看支持的语言完整列表并了解如何启用它们。