# LLM 设置

AIGNE DocSmith 利用大型语言模型 (LLM) 生成高质量的文档。该平台设计灵活，允许您连接各种 AI 模型提供商。您可以使用集成的 AIGNE Hub 以获得免设置体验，或配置自己的 API 密钥以进行更直接的控制。

## AIGNE Hub (推荐)

最简单的入门方法是使用 AIGNE Hub。它充当多个领先 LLM 提供商的网关，具有以下几个主要优点：

- **无需 API 密钥：** 您可以立即开始生成文档，而无需注册单独的 AI 服务或管理密钥。
- **轻松切换模型：** 您可以通过在命令行参数中指定不同模型来轻松进行试验。这使您可以为特定任务选择最佳模型。

要通过 AIGNE Hub 使用特定模型，只需在 `generate` 命令中使用 `--model` 标志即可：

```bash
# 使用谷歌的 Gemini 2.5 Flash 生成内容
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 生成内容
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 生成内容
aigne doc generate --model openai:gpt-4o
```

如果未指定模型，DocSmith 将使用为您的项目配置的默认模型。

## 使用自定义 API 密钥

如果您倾向于使用自己从 OpenAI、Anthropic 等提供商处获取的 API 密钥，DocSmith 也支持此方式。这种方法让您可以直接控制您在所选提供商的 API 使用和计费。

自定义 API 密钥的配置是通过交互式设置向导完成的。您可以通过运行以下命令来启动它：

```bash
aigne doc init
```

该向导将指导您完成选择提供商和输入必要凭据的过程。要获取完整的操作指南，请参阅 [交互式设置](./configuration-interactive-setup.md) 指南。

## 默认模型配置

为确保项目范围内的一致性，您可以在项目的 `aigne.yaml` 配置文件中定义一个默认的 LLM。该模型将用于所有生成任务，除非在命令中通过 `--model` 标志指定了其他模型。

以下是在 `aigne.yaml` 中设置默认模型的示例：

```yaml
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此示例中，所有文档生成任务将默认使用谷歌的 `gemini-2.5-pro` 模型，并将 `temperature` 设置为 `0.8`。

---

配置好 LLM 提供商后，您就可以生成各种语言的内容了。要查看支持语言的完整列表以及启用方法，请参阅 [语言支持](./configuration-language-support.md) 指南。