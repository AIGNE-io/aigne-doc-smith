# LLM 設定

AIGNE DocSmith 使用大型語言模型 (LLM) 來產生文件內容。AI 模型提供者的設定可以透過兩種主要方式完成：使用整合的 AIGNE Hub 或連接您自己選擇的提供者的自訂 API 金鑰。

## AIGNE Hub (推薦)

設定 LLM 最直接的方法是透過 AIGNE Hub。它作為多個 LLM 提供者的閘道，提供兩大好處：

- **無需 API 金鑰：** 您可以產生文件，而無需管理自己的 API 金鑰或服務訂閱。
- **靈活的模型切換：** 您可以使用 `--model` 旗標為任何指令變更 AI 模型。

若要透過 AIGNE Hub 使用特定模型，請在您的指令後加上 `--model` 旗標。以下範例展示了其用法：

```bash 透過 AIGNE Hub 使用不同模型 icon=mdi:code-braces
# 使用 OpenAI 的 GPT-4o 模型
aigne doc generate --model openai:gpt-4o

# 使用 Anthropic 的 Claude 4.5 Sonnet 模型
aigne doc generate --model anthropic:claude-sonnet-4-5

# 使用 Google 的 Gemini 2.5 Pro 模型
aigne doc generate --model google:gemini-2.5-pro
```

如果未指定 `--model` 旗標，DocSmith 將預設使用您專案設定檔中定義的模型。

## 使用自訂 API 金鑰

對於偏好使用自己在 OpenAI、Anthropic 或 Google 等提供者帳戶的使用者，DocSmith 可以設定個人 API 金鑰。此方法可直接控制 API 的使用和計費。

設定是透過互動式精靈處理的。若要啟動它，請執行以下指令：

```bash 啟動互動式精靈 icon=lucide:magic-wand
aigne doc init
```

精靈會提示您選擇您的提供者並輸入必要的憑證。有關此過程的完整逐步指南，請參閱 [互動式設定](./configuration-interactive-setup.md) 文件。

## 設定預設模型

為維持所有文件產生任務的一致性，可以在您專案的 `aigne.yaml` 設定檔中設定預設的 LLM。此模型將用於任何未明確包含 `--model` 旗標的指令。

以下是範例設定：

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此範例中，DocSmith 設定為使用 Google 的 `gemini-2.5-pro` 模型，並將 `temperature` 設定為 `0.8`，作為所有產生任務的預設值。

---

設定好 LLM 提供者後，下一步是管理您文件的語言設定。請前往 [語言支援](./configuration-language-support.md) 指南，查看支援的語言完整列表並了解如何啟用它們。