# LLM 設定

AIGNE DocSmith 使用大型語言模型 (LLM) 來生成文件內容。您可以透過兩種方式設定 AI 模型提供者：使用整合的 AIGNE Hub，或連接您自己的自訂 API 金鑰。

## AIGNE Hub (推薦)

最直接的入門方式是使用 AIGNE Hub。它作為多個 LLM 提供者的閘道，提供兩大主要優勢：

- **無需 API 金鑰：** 您無需管理自己的 API 金鑰或服務訂閱即可生成文件。
- **輕鬆切換模型：** 您可以使用 `--model` 旗標為任何指令變更 AI 模型。

若要透過 AIGNE Hub 使用特定模型，請在您的指令中加入 `--model` 旗標。以下是一些範例：

```bash 透過 AIGNE Hub 使用不同模型 icon=mdi:code-braces
# 使用 OpenAI 的 GPT-4o 模型
aigne doc generate --model openai:gpt-4o

# 使用 Anthropic 的 Claude 3.5 Sonnet 模型
aigne doc generate --model anthropic:claude-3-5-sonnet
```

如果您未指定模型，DocSmith 將使用您專案設定中定義的預設模型。

## 使用自訂 API 金鑰

如果您偏好使用自己如 OpenAI 或 Anthropic 等提供者的帳戶，您可以使用個人 API 金鑰來設定 DocSmith。這種方法讓您能直接控制 API 的使用和計費。

設定是透過互動式精靈處理的。若要啟動它，請執行以下指令：

```bash
aigne doc init
```

精靈會提示您選擇提供者並輸入您的憑證。如需完整指南，請參閱 [互動式設定](./configuration-interactive-setup.md) 文件。

## 設定預設模型

為了在所有文件生成任務中保持一致性，您可以在專案的 `aigne.yaml` 設定檔中設定預設的 LLM。任何不包含 `--model` 旗標的指令都將使用此模型。

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

在此範例中，DocSmith 被設定為預設使用 Google 的 `gemini-2.5-pro` 模型，並將 `temperature` 設定為 `0.8`。

---

設定好您的 LLM 提供者後，您就可以開始管理文件的語言設定了。請前往 [語言支援](./configuration-language-support.md) 指南，查看支援的語言完整清單並了解如何啟用它們。