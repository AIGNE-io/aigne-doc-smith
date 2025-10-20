# 總覽

AIGNE DocSmith 是一款利用人工智慧從專案原始碼自動建立說明文件的工具。它建立在 [AIGNE Framework](https://www.aigne.io/en/framework) 之上，旨在產生能準確反映您程式碼庫的結構化、多語言文件。

DocSmith 的主要目標是解決手動編寫說明文件的常見挑戰，例如耗時、隨著程式碼變更而過時以及缺乏一致性。透過自動化此過程，DocSmith 有助於確保您的說明文件保持最新且準確。

## 運作方式

DocSmith 透過分析您專案的原始碼來理解其結構、元件和功能。基於此分析，它會生成一套完整的說明文件，從高階指南到詳細的 API 參考都包含在內。

```d2
direction: down

Source-Code: {
  label: "專案原始碼"
  shape: rectangle
}

DocSmith: {
  label: "AIGNE DocSmith\n（AI 分析引擎）"
  shape: rectangle
}

Docs: {
  label: "生成的說明文件"
  shape: rectangle
}

Source-Code -> DocSmith: "分析"
DocSmith -> Docs: "生成"
```

## 核心功能

DocSmith 提供一系列功能來處理從建立到發布的整個說明文件生命週期。

*   **AI 驅動生成**：分析您的程式碼庫以提出合乎邏輯的說明文件結構，並生成解釋您程式碼功能的內容。
*   **多語言支援**：將說明文件翻譯成 12 種語言，包括英文、簡體中文和日文。翻譯過程會感知上下文，以保持技術準確性。
*   **與大型語言模型（LLM）整合**：可連接各種大型語言模型（LLM）。預設情況下，它使用 [AIGNE Hub](https://www.aigne.io/en/hub)，這項服務讓您可以在 Google Gemini 和 OpenAI GPT 等模型之間切換，而無需單獨的 API 金鑰。您也可以設定自己的 API 金鑰以直接存取供應商。
*   **智慧更新**：偵測您原始碼中的變更，並更新說明文件中相應的部分。您也可以提供具體的回饋來優化生成的內容。
*   **發布選項**：只需一個指令即可發布您生成的說明文件。您可以部署到官方的 DocSmith 平台，或執行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 實例。Discuss Kit 是一項用於託管和展示說明文件的服務。

## 可用指令

DocSmith 透過一組指令進行操作。下表總結了主要指令及其功能。

| Command | Description |
| :--- | :--- |
| `generate` | 從您的來源檔案建立一組新的說明文件。 |
| `update` | 根據程式碼變更或新的回饋修改現有文件。 |
| `translate` | 將文件翻譯成 12 種支援語言中的一種或多種。 |
| `publish` | 將您的說明文件部署到一個可公開存取的 URL。 |
| `evaluate` | 評估您生成的說明文件的品質和完整性。 |
| `history` | 查看對您的說明文件所做的更新歷史記錄。 |
| `clear` | 移除生成的文件、設定和快取資料。 |
| `prefs` | 管理用於生成說明文件的已儲存偏好設定和組態。 |

---

本總覽提供了 AIGNE DocSmith 的用途和功能的高階摘要。要開始使用此工具，請繼續閱讀 [開始使用](./getting-started.md) 指南以取得安裝和設定說明。