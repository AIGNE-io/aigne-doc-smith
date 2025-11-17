# 總覽

是否還在為了讓文件與不斷變化的程式碼庫保持同步而煩惱？AIGNE DocSmith 可自動化整個流程，分析您的原始碼以生成準確、結構化且多語言的文件，讓您能專注於打造卓越的軟體。

AIGNE DocSmith 是一款由 AI 驅動的工具，可從您專案的原始碼中自動建立文件。它建立在 [AIGNE Framework](https://www.aigne.io/en/framework) 之上，旨在產生能準確反映您程式碼庫的結構化、多語言文件。

此工具解決了手動編寫文件時的常見挑戰，例如建立過程耗時、隨著程式碼演進而迅速過時，以及不同章節之間缺乏一致性。透過自動化此流程，DocSmith 有助於確保您的文件保持最新、準確且實用。

## 運作方式

DocSmith 的運作方式是分析您專案的原始碼，以理解其結構、元件和功能。基於此分析，它會生成一套完整的文件，從高階指南到詳細的 API 參考都包含在內。

```d2
direction: down

Source-Code: {
  label: "原始碼"
  shape: rectangle
}

AIGNE-DocSmith: {
  label: "AIGNE DocSmith"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Analysis-Engine: {
    label: "分析引擎"
    shape: rectangle
  }

  Generation-Engine: {
    label: "生成引擎"
    shape: rectangle
  }

  Translation-Engine: {
    label: "翻譯引擎"
    shape: rectangle
  }

  LLMs: {
    label: "大型語言模型"
    shape: rectangle

    AIGNE-Hub: {
      label: "AIGNE Hub"
    }

    Direct-Access: {
      label: "直接存取"
      shape: rectangle
      Google-Gemini: {}
      OpenAI-GPT: {}
    }
  }
}

Published-Documentation: {
  label: "已發布的文件"
  shape: rectangle

  DocSmith-Platform: {
    label: "DocSmith 平台"
  }

  Discuss-Kit: {
    label: "Discuss Kit"
  }
}

Source-Code -> AIGNE-DocSmith.Analysis-Engine: "分析"
AIGNE-DocSmith.Analysis-Engine -> AIGNE-DocSmith.Generation-Engine: "生成"
AIGNE-DocSmith.Generation-Engine <-> AIGNE-DocSmith.LLMs: "利用"
AIGNE-DocSmith.Generation-Engine -> AIGNE-DocSmith.Translation-Engine: "翻譯"
AIGNE-DocSmith.Translation-Engine -> Published-Documentation: "發布"

```

## 核心功能

DocSmith 提供一系列功能來處理從建立到發布的整個文件生命週期。

*   **AI 驅動生成**：分析您的程式碼庫以提出合乎邏輯的文件結構，並生成解釋您程式碼功能的內容。
*   **多語言支援**：將文件翻譯成 12 種語言，包括英文、簡體中文和日文。翻譯過程具備情境感知能力，以保持技術準確性。
*   **與大型語言模型 (LLM) 整合**：可連接各種大型語言模型 (LLM)。預設情況下，它使用 [AIGNE Hub](https://www.aigne.io/en/hub)，這項服務讓您可以在 Google Gemini 和 OpenAI GPT 等模型之間切換，而無需單獨的 API 金鑰。您也可以設定自己的 API 金鑰以直接存取供應商。
*   **智慧更新**：偵測您原始碼中的變更，並更新文件的相應部分。您也可以提供具體的回饋來完善生成的內容。
*   **發布選項**：只需一個指令即可發布您生成的文件。您可以部署到官方的 DocSmith 平台，或自行運作 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 的執行個體。Discuss Kit 是一項用於託管和顯示文件的服務。

## 可用指令

DocSmith 透過命令列介面進行操作。下表總結了主要指令及其功能。

| Command | Description |
| :--- | :--- |
| `generate` | 從您的原始檔案建立一套新的文件。 |
| `update` | 根據程式碼變更或新的回饋來修改現有文件。 |
| `translate` | 將文件翻譯成 12 種支援的語言中的一種或多種。 |
| `publish` | 將您的文件部署到一個可公開存取的即時 URL。 |
| `evaluate` | 評估您建立文件的品質與完整性。 |
| `history` | 檢視對您的文件所做的更新歷史記錄。 |
| `chat` | 啟動一個互動模式，以建立和管理文件。 |
| `clear` | 移除建立的文件、設定和快取資料。 |
| `init` | 引導您完成一個互動式流程，以建立初始設定檔。 |
| `prefs` | 管理用於文件建立的已儲存偏好設定和組態。 |

---

本總覽概述了 AIGNE DocSmith 的用途與功能。若要開始使用此工具，請前往 [入門指南](./getting-started.md) 以取得安裝和設定說明。