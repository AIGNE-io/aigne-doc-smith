# 品質保證

為確保所有產生的文件都符合高品質、一致性和準確性的標準，DocSmith 內建了一個全面、自動化的品質保證流程。這些內建的檢查會在發布前自動運行，以識別並標記常見的格式錯誤、失效連結和結構性問題。此過程確保最終的輸出成品具備專業性、可靠性，並讓使用者易於瀏覽。

```d2 品質保證流程 icon=lucide:shield-check
direction: down

Documentation-Content: {
  label: "文件內容"
  shape: rectangle
}

Quality-Assurance-Pipeline: {
  label: "品質保證流程"
  shape: rectangle
  grid-columns: 3
  grid-gap: 50

  Markdown-Validation: {
    label: "1. Markdown 與內容驗證\n(基於 remark-lint)"
    shape: rectangle

    Check-1: "有效的 Markdown 語法"
    Check-2: "標題完整性"
    Check-3: "表格格式"
    Check-4: "程式碼區塊完整性"
    Check-5: "內容完整性"
  }

  Link-Asset-Validation: {
    label: "2. 連結與資源完整性"
    shape: rectangle

    Check-6: "失效連結偵測"
    Check-7: "本地圖片驗證"
  }

  D2-Diagram-Validation: {
    label: "3. D2 圖表驗證"
    shape: rectangle

    Check-8: "D2 語法檢查"
  }
}

Validation-Result: {
  label: "所有檢查是否通過？"
  shape: diamond
}

Published-Documentation: {
  label: "已發布的文件"
  shape: rectangle
  style.fill: "#d4edda"
}

Error-Report: {
  label: "錯誤報告"
  shape: rectangle
  style.fill: "#f8d7da"
}

Documentation-Content -> Quality-Assurance-Pipeline: "輸入"
Quality-Assurance-Pipeline -> Validation-Result: "驗證"
Validation-Result -> Published-Documentation: "是"
Validation-Result -> Error-Report: "否"
```

## Markdown 與內容結構驗證

品質保證的基礎是確保核心 Markdown 格式正確且結構健全。DocSmith 採用一個基於 `remark-lint` 的精密 linter，並輔以自訂檢查來捕捉常見的結構性問題。

主要的結構和格式檢查包括：

*   **有效的 Markdown 語法**：遵循標準 Markdown 和 GFM (GitHub Flavored Markdown) 規範。
*   **標題完整性**：偵測同一文件內的重複標題、不正確的標題縮排，以及使用超過一個頂層標題 (H1) 等問題。
*   **表格格式**：驗證表格結構是否正確，特別是檢查標頭、分隔線和資料列之間的欄位數量是否不匹配。
*   **程式碼區塊完整性**：確保所有程式碼區塊都以 ``` 正確地開啟和關閉。它還會檢查程式碼區塊內可能影響渲染結果的不一致縮排。
*   **內容完整性**：一個驗證步驟，透過檢查產生的內容是否以適當的標點符號結尾，來確保內容不會看似被截斷。

## 連結與資源完整性

失效連結和遺失的圖片會降低使用者體驗。DocSmith 會執行檢查以驗證所有本地資源。

*   **失效連結偵測**：系統會掃描所有相對 Markdown 連結，並驗證目標路徑是否對應到專案文件結構中定義的有效文件。此檢查可防止使用者在瀏覽文件時遇到「404 Not Found」錯誤。以 `http://` 或 `https://` 開頭的外部連結則不會被檢查。
*   **本地圖片驗證**：對於所有透過 `![]()` 包含的本地圖片，驗證器會確認所引用的圖片檔案是否存在於指定路徑。這能確保最終的輸出成品中不會出現破損的圖片。

## D2 圖表驗證

為保證所有圖表都能正確渲染，DocSmith 會驗證每個 D2 圖表的語法。

每個標記為 `d2` 的程式碼區塊都會經過嚴格的語法檢查器處理。若發現任何語法錯誤，產生過程將會被中止，並顯示一則描述性的錯誤訊息。這可以防止發布含有破損或渲染不當的視覺圖表的文件。