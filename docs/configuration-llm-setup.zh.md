---
labels: ["Reference"]
---

# LLM 设置

AIGNE DocSmith 利用大语言模型 (LLM) 的强大功能来生成高质量的文档。您可以灵活地从各种 LLM 提供商中进行选择，以最好地满足您项目的需求。本指南将带您了解可用的配置选项。

## AIGNE Hub (推荐)

配置 LLM 最简单且最推荐的方法是通过 AIGNE Hub。该集成服务可作为通往多个先进模型的网关，无需您管理自己的 API 密钥。

**主要优势：**

- **无需 API 密钥：** 无需注册第三方 AI 服务即可立即开始生成文档。
- **轻松切换模型：** 使用简单的命令行标志即可在不同 LLM 之间轻松切换，以找到最适合您内容风格和复杂度的模型。

要通过 AIGNE Hub 使用特定模型，只需在 `aigne doc generate` 命令中使用 `--model` 标志。这使您可以即时试验不同的模型。

```bash 使用 AIGNE Hub 切换不同模型 icon=lucide:terminal
# 使用 Google 的 Gemini 1.5 Flash 生成文档
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 生成文档
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 生成文档
aigne doc generate --model openai:gpt-4o
```

## 使用自定义 API 密钥

如果您希望为 OpenAI、Anthropic 等提供商使用自己的 API 密钥，DocSmith 也同样支持。您可以在项目设置期间使用交互式配置向导配置您的自定义密钥。

要设置您的自定义 API 密钥，请运行 `init` 命令：

```bash 启动交互式配置 icon=lucide:terminal
aigne doc init
```

该向导将引导您选择偏好的 LLM 提供商并输入必要的凭据。关于引导式设置的完整步骤，请参阅 [交互式设置](./configuration-interactive-setup.md) 指南。

---

LLM 配置完成后，您就可以开始创建文档了。要了解有关核心生成过程的更多信息，请参阅 [生成文档](./features-generate-documentation.md) 部分。