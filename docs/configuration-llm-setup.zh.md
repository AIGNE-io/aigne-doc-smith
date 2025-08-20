---
labels: ["Reference"]
---

# LLM 设置

AIGNE DocSmith 使用大型语言模型 (LLMs) 生成高质量的文档内容。您可以灵活地选择不同的 LLM 提供商，本指南将引导您了解各种设置选项。

## 使用 AIGNE Hub (推荐)

最简单的入门方法是使用 AIGNE Hub。我们向大多数用户推荐此方法，因为它不需要您提供自己的 API 密钥，并允许您在不同提供商的各种模型之间轻松切换。

要通过 AIGNE Hub 使用特定模型，只需在命令中添加 `--model` 标志即可。无需事先配置 API 密钥。

**切换模型示例：**

```bash
# 使用 Google 的 Gemini 1.5 Flash 生成文档
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 生成文档
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 生成文档
aigne doc generate --model openai:gpt-4o
```

## 使用自定义 API 密钥

如果您希望使用您在 OpenAI 或 Anthropic 等 LLM 提供商处的个人或企业账户，可以使用自己的 API 密钥来配置 DocSmith。

此设置通过交互式配置向导完成。要开始此过程，请运行 `init` 命令：

```bash
aigne doc init
```

该向导将引导您选择 LLM 提供商并安全地输入您的 API 密钥。这是一次性设置，相关设置将保存并应用于未来的所有命令。

---

无论您是选择 AIGNE Hub 的便利，还是选择自定义 API 密钥的灵活性，DocSmith 都能让您轻松利用强大的 AI 来创建文档。配置好 LLM 后，您就可以开始 [生成文档](./features-generate-documentation.md) 了。