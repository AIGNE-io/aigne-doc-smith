# 運作方式

AIGNE DocSmith 運作於一個多 Agent 系統之上。它並非單一的巨型流程，而是協調一個由專業化 AI Agent 組成的流程，其中每個 Agent 負責一項特定任務。這種方法實現了一個結構化和模組化的流程，能將原始程式碼轉換為完整的文件。

此工具是更廣泛的 AIGNE 生態系統中不可或缺的一部分，該生態系統為開發和部署 AI 應用程式提供了一個平台。

![AIGNE 生態系統架構](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 文件產生流程

DocSmith 的核心是一個將您的原始程式碼經過數個不同階段處理的流程。每個階段都由一個或多個專門的 Agent 管理。主要的工作流程，通常由 `aigne doc generate` 指令啟動，可視覺化如下：

```d2
direction: down

Input: {
  label: "原始程式碼與設定"
  shape: rectangle
}

Pipeline: {
  label: "核心產生流程"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. 結構規劃"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. 內容產生"
    shape: rectangle
  }

  Saving: {
    label: "3. 儲存文件"
    shape: rectangle
  }
}

User-Feedback: {
  label: "使用者回饋循環\n(透過 --feedback 旗標)"
  shape: rectangle
}

Optional-Steps: {
  label: "選用的後產生步驟"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "翻譯\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "發布\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "優化結構"
User-Feedback -> Pipeline.Content-Generation: "重新產生內容"
```

1.  **輸入分析**：當 Agent 載入您的原始程式碼和專案設定（`aigne.yaml`）時，流程便開始了。

2.  **結構規劃**：一個 Agent 會分析程式庫以提出一個合乎邏輯的文件結構。它會根據專案的組成和任何指定的規則來建立大綱。

3.  **內容產生**：結構就緒後，內容產生 Agent 會在文件計畫的每個部分填入詳細的文字、程式碼範例和說明。

4.  **優化與更新**：當您透過 `aigne doc update` 或 `aigne doc generate --feedback` 提供輸入時，特定的 Agent 會被啟動以更新個別文件或調整整體結構。

5.  **翻譯與發布**：主要內容產生後，選用的 Agent 會處理多語言翻譯和將最終文件發布到網路平台等任務。

## 關鍵 AI Agent

DocSmith 的功能由專案設定中定義的一系列 Agent 提供。每個 Agent 都有特定的角色。下表列出了一些關鍵 Agent 及其功能。

| 功能角色 | 關鍵 Agent 檔案 | 說明 |
| :--- | :--- | :--- |
| **結構規劃** | `generate/generate-structure.yaml` | 分析原始程式碼以提出初始的文件大綱。 |
| **結構優化** | `generate/refine-document-structure.yaml` | 根據使用者回饋修改文件結構。 |
| **內容產生** | `update/batch-generate-document.yaml`, `update/generate-document.yaml` | 為文件結構的每個部分填入詳細內容。 |
| **翻譯** | `translate/translate-document.yaml`, `translate/translate-multilingual.yaml` | 將產生的文件翻譯成多個目標語言。 |
| **發布** | `publish/publish-docs.mjs` | 管理將文件發布到 Discuss Kit 實例的流程。 |
| **資料 I/O** | `utils/load-sources.mjs`, `utils/save-docs.mjs` | 負責讀取來源檔案並將最終的 markdown 文件寫入磁碟。 |

這種基於 Agent 的架構讓文件流程的每一步都由專門的工具處理，確保了工作流程的結構化和可維護性。

---

要了解 DocSmith 為確保輸出準確性和格式所採取的措施，請前往 [品質保證](./advanced-quality-assurance.md) 部分。