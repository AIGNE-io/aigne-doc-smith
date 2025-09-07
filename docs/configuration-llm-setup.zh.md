# LLM 设置

AIGNE DocSmith 使用大型语言模型 (LLM) 生成文档。该平台设计灵活，允许你连接到各种 AI 模型提供商。你可以使用集成的 AIGNE Hub 获得免设置的体验，或配置你自己的 API 密钥以进行直接控制。

## AIGNE Hub (推荐)

最简单的入门方法是使用 AIGNE Hub。它充当多个领先 LLM 提供商的网关，提供几个关键优势：

- **无需 API 密钥：** 你可以立即开始生成文档，无需注册单独的 AI 服务或管理密钥。
- **轻松切换模型：** 你可以通过将不同模型指定为命令行参数来进行试验。这使你可以为特定任务选择最佳模型。

要通过 AIGNE Hub 使用特定模型，请在 `generate` 命令中使用 `--model` 标志：

```bash
# 使用 Google 的 Gemini 2.5 Flash 生成内容
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 生成内容
aigne doc generate --model anthropic:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 生成内容
aigne doc generate --model openai:gpt-4o
```

如果未指定模型，DocSmith 将使用为你的项目配置的默认模型。

## 使用自定义 API 密钥

如果你更喜欢使用来自 OpenAI、Anthropic 或其他提供商的自己的 API 密钥，DocSmith 也支持这种方式。这种方法让你能够直接控制你所选提供商的 API 使用和计费。

自定义 API 密钥的配置通过交互式设置向导处理。你可以通过运行以下命令来启动它：

```bash
aigne doc init
```

该向导将指导你完成选择提供商并输入必要凭据的过程。如需完整的操作指南，请参阅[交互式设置](./configuration-interactive-setup.md)指南。

## 默认模型配置

为了项目范围的一致性，你可以在项目的 `aigne.yaml` 配置文件中定义一个默认的 LLM。该模型将用于所有生成任务，除非在命令中使用 `--model` 标志指定了其他模型。

以下是如何在 `aigne.yaml` 中设置默认模型的示例：

```yaml
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此示例中，所有文档生成将默认使用 Google 的 `gemini-2.5-pro` 模型，并将 `temperature` 设置为 `0.8`。

---

配置好 LLM 提供商后，你就可以生成各种语言的内容了。要查看支持的语言完整列表以及如何启用它们，请继续阅读[语言支持](./configuration-language-support.md)指南。