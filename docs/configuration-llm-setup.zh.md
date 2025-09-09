# LLM 设置

AIGNE DocSmith 使用大型语言模型 (LLMs) 生成文档内容。该工具提供两种配置 AI 模型提供商的主要方法：使用集成的 AIGNE Hub 以获得简化的体验，或连接你自己的自定义 API 密钥以直接访问提供商。

## AIGNE Hub (推荐)

最简单的入门方法是使用 AIGNE Hub。它充当多个 LLM 提供商的网关，提供两大关键优势：

- **无需 API 密钥：** 无需管理自己的 API 密钥或服务订阅即可生成文档。
- **轻松切换模型：** 使用一个简单的标志即可为任何命令更改 AI 模型。

要通过 AIGNE Hub 使用特定模型，请在命令中添加 `--model` 标志。以下是一些示例：

```bash 使用 Google 的 Gemini 2.5 Flash 模型
aigne doc generate --model google:gemini-2.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet 模型
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o 模型
aigne doc generate --model openai:gpt-4o
```

如果不指定模型，DocSmith 将使用项目配置中定义的默认模型。

## 使用自定义 API 密钥

如果你更喜欢使用自己在 OpenAI 或 Anthropic 等提供商处的账户，可以用个人 API 密钥来配置 DocSmith。这样你就可以直接控制 API 的使用和计费。

配置通过交互式向导完成。运行以下命令以启动它：

```bash
aigne doc init
```

该向导将提示你选择提供商并输入凭据。有关完整指南，请参阅 [交互式设置](./configuration-interactive-setup.md) 文档。

## 设置默认模型

为确保所有文档生成任务的一致性，你可以在项目的 `aigne.yaml` 配置文件中设置默认的 LLM。除非使用 `--model` 标志覆盖，否则将自动使用此模型。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此配置中，DocSmith 默认对所有生成任务使用 Google 的 `gemini-2.5-pro` 模型，并将 `temperature` 设置为 `0.8`。

---

既然你的 LLM 提供商已配置完毕，你可以探索如何管理文档的翻译。请继续阅读 [语言支持](./configuration-language-support.md) 指南，查看支持的语言完整列表并了解如何启用它们。