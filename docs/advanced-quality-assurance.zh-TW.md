# 品質保證

為確保所有生成的文檔功能正常、清晰且專業，DocSmith 整合了一個自動化的品質保證流程。此流程會在發布前對 Markdown 內容執行一系列檢查，以偵測並報告從斷開的連結到格式錯誤的圖表等常見問題。

這個自動化管道會驗證內容結構、連結、媒體和語法，以維持一致的品質標準。

```d2
direction: down

Input-Markdown-Content: {
  label: "輸入：Markdown 內容"
  shape: rectangle
}

QA-Pipeline: {
  label: "QA 管道"
  shape: rectangle
  grid-columns: 1
  grid-gap: 50

  Structural-Checks: {
    label: "結構檢查"
    shape: rectangle
    grid-columns: 2
    Completeness: "確保內容未被截斷"
    Code-Blocks: "驗證區塊語法與縮排"
  }

  Content-Validation: {
    label: "內容驗證"
    shape: rectangle
    grid-columns: 2
    Link-Integrity: "驗證內部連結"
    Image-Paths: "檢查本地圖片是否存在"
    Table-Formatting: "匹配欄位數量"
  }

  Syntax-Validation: {
    label: "語法驗證"
    shape: rectangle
    grid-columns: 2
    D2-Diagrams: "驗證 D2 語法"
    Markdown-Linting: "強制執行樣式規則"
  }
}

Output-Validated-Content-or-Error-Report: {
  label: "輸出：已驗證的內容或錯誤報告"
  shape: rectangle
}

Input-Markdown-Content -> QA-Pipeline
QA-Pipeline -> Output-Validated-Content-or-Error-Report
```

### 核心驗證領域

DocSmith 的品質保證流程涵蓋了幾個關鍵領域，以確保文檔的完整性。

#### 內容結構與完整性

DocSmith 執行多項檢查，以確保內容的結構完整性：

- **不完整的程式碼區塊**：偵測以 ` ``` ` 開啟但未關閉的程式碼區塊。
- **缺少換行符**：識別出現在單一行上的內容，這可能表示缺少換行符。
- **內容結尾**：驗證內容是否以適當的標點符號（例如 `.`、`)`、`|`、`>`）結尾，以防止輸出被截斷。
- **程式碼區塊縮排**：分析程式碼區塊中不一致的縮排。如果某一行程式碼的縮排少於開頭的 ` ``` ` 標記，可能會導致渲染問題。此檢查有助於維持正確的程式碼呈現。

#### 連結與媒體完整性

- **連結完整性**：文檔中的所有相對連結都會根據文檔結構計畫進行驗證，以防止出現無效連結。這確保了所有內部導覽都能如預期般運作。檢查器會忽略外部連結（以 `http://` 或 `https://` 開頭）和 `mailto:` 連結。

- **圖片驗證**：為避免圖片損壞，檢查器會驗證文檔中引用的任何本地圖片檔案是否存在於檔案系統中。它會解析相對和絕對路徑，以確認檔案存在。外部圖片 URL 和資料 URL 不會被檢查。

#### 圖表語法驗證

- **D2 圖表**：DocSmith 透過嘗試將程式碼編譯成 SVG 圖片來驗證 D2 圖表語法。此過程能在語法錯誤導致圖形損壞前捕捉到它們。

#### 格式化與樣式強制執行

- **表格格式化**：檢查表格的標頭、分隔線和資料行之間的欄位數量是否不匹配。此檢查可防止常見的表格渲染失敗。

- **Markdown 語法檢查**：內建的 linter 強制執行一致的 Markdown 結構。主要規則包括：

| Rule ID | Description |
|---|---|
| `no-duplicate-headings` | 防止在同一部分中出現內容相同的多個標題。 |
| `no-undefined-references` | 確保所有連結和圖片引用都已定義。 |
| `no-unused-definitions` | 標記未使用的連結或圖片定義。 |
| `no-heading-content-indent` | 不允許在標題內容前縮排。 |
| `no-multiple-toplevel-headings` | 每個文件只允許一個頂層標題 (H1)。 |
| `code-block-style` | 強制執行一致的程式碼區塊樣式（例如，使用反引號）。 |

透過自動化這些檢查，DocSmith 維護了文檔的一致標準，確保最終輸出準確且易於導覽。

若要了解更多關於整體架構的資訊，請參閱 [運作方式](./advanced-how-it-works.md) 部分。