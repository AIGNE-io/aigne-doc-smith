---
labels: ["Reference"]
---

# LLM 设置

AIGNE DocSmith 利用大型语言模型 (LLMs) 生成高质量的文档。你可以通过两种主要方法配置 DocSmith 以使用不同的 AI 模型：推荐的 AIGNE Hub 服务，或提供你自己的自定义 API 密钥。

本指南将引导你了解这两种选项。

## 使用 AIGNE Hub (推荐)

通过 AIGNE Hub 是将 DocSmith 与 LLMs 结合使用的最直接方法。该方法具有以下显著优势：

- **无需 API 密钥：** 你无需注册单独的 AI 服务或管理自己的 API 密钥。
- **轻松切换模型：** 你可以通过一个简单的命令行标志，在 Google、Anthropic 和 OpenAI 等提供商提供的不同顶尖模型之间进行切换。

要指定模型，请在 `generate` 命令中使用 `--model` 标志。DocSmith 将通过 AIGNE Hub 处理 API 请求。

### 示例

以下示例展示了如何通过 AIGNE Hub 使用不同的模型生成文档：

**使用 Google 的 Gemini 1.5 Flash：**
```bash
aigne doc generate --model google:gemini-2.5-flash
```

**使用 Anthropic 的 Claude 3.5 Sonnet：**
```bash
aigne doc generate --model claude:claude-3-5-sonnet
```

**使用 OpenAI 的 GPT-4o：**
```bash
aigne doc generate --model openai:gpt-4o
```

## 配置自定义 API 密钥

如果你希望为 OpenAI 或 Anthropic 等提供商使用自己的 API 密钥，可以通过交互式设置向导进行配置。

运行 `init` 命令启动向导，它将指导你完成 LLM 提供商、凭据以及其他项目设置。

```bash
# 启动交互式配置向导
aigne doc init
```

该过程可确保你的密钥被正确存储，以便用于所有后续的文档生成和更新任务。

## 工作原理

下图说明了 DocSmith 在不同 LLM 配置下处理请求的流程。

```d2
direction: down

User: {
  shape: person
  label: "开发者"
}

CLI: "`aigne doc generate`"

DocSmith: {
  shape: package
  "配置检查": {
    "AIGNE Hub (默认)": "无需 API 密钥"
    "自定义提供商": "找到用户 API 密钥"
  }
}

LLM_Providers: {
  label: "LLM 提供商"
  shape: cloud
  "AIGNE Hub": "管理对多个模型的访问"
  "直接 API (例如 OpenAI)": "使用自定义密钥"
}

User -> CLI: "运行命令"
CLI -> DocSmith: "启动流程"
DocSmith."配置检查"."AIGNE Hub (默认)" -> LLM_Providers."AIGNE Hub" : "通过 Hub 路由请求"
DocSmith."配置检查"."自定义提供商" -> LLM_Providers."直接 API (例如 OpenAI)" : "使用用户密钥路由请求"

```

---

配置好 LLM 提供商后，你就可以为文档自定义语言设置了。请在 [语言支持](./configuration-language-support.md) 指南中了解更多信息。