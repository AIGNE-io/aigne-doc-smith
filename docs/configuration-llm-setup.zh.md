---
labels: ["Reference"]
---

# LLM 设置

AIGNE DocSmith 利用大语言模型 (LLM) 为你的文档生成内容。你可以将 DocSmith 配置为使用不同的人工智能模型，从而控制内容生成的质量、风格和成本。

本指南介绍了设置 LLM 提供商的主要方法。

## 使用 AIGNE Hub (推荐)

最直接的方法是使用 AIGNE Hub。该方法允许你访问来自不同提供商的多种模型，而无需提供自己的 API 密钥。因其简单性和灵活性，这是为大多数用户推荐的选择。

**主要优点：**
- **无需 API 密钥：** 你可以立即开始生成文档，无需任何复杂的设置。
- **轻松切换模型：** 你可以直接通过命令行，在 Google、Anthropic 和 OpenAI 等提供商提供的不同大语言模型之间轻松切换。

要为生成任务使用特定模型，只需在 `aigne doc generate` 命令中添加 `--model` 标志即可。这可以让你尝试不同的模型，以找到最适合你项目的结果。

### 命令示例

以下是如何动态选择不同模型的方法：

```bash
# 使用 Google 的 Gemini 2.5 Flash 模型生成文档
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 模型生成文档
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 模型生成文档
aigne doc generate --model openai:gpt-4o
```

如果在运行生成命令时不带 `--model` 标志，DocSmith 将使用通过 AIGNE Hub 配置的默认模型。

## 使用自定义 API 密钥

此外，如果你更倾向于使用个人或企业账户来调用 OpenAI、Anthropic 等提供商的服务，DocSmith 也支持使用自定义 API 密钥。这能让你更直接地控制 API 的使用情况和计费。

---

配置好 LLM 后，你就可以控制 DocSmith 另一个强大的功能：多语言输出。要了解更多信息，请继续阅读 [语言支持](./configuration-language-support.md) 指南。