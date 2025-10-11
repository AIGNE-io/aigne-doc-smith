# 產生文件

本指南提供了一套系統化程序，可從您的專案原始檔案建立一套完整的文件。此程序透過 `aigne doc generate` 指令啟動，該指令會分析您的程式碼庫、提出邏輯結構，然後為每份文件撰寫內容。

此指令是初次建立文件的主要工具。若要在文件建立後進行修改，請參閱 [更新文件](./guides-updating-documentation.md) 指南。

### 產生工作流程

`generate` 指令會執行一系列自動化步驟來建置您的文件。此程序設計為互動式，讓您能在內容撰寫前審閱並批准建議的結構。

```d2
direction: down

start: {
  label: "開始"
  shape: oval
}

run_command: {
  label: "執行 'aigne doc generate'"
  shape: rectangle
}

check_config: {
  label: "設定檔是否存在？"
  shape: diamond
}

interactive_setup: {
  label: "引導進行互動式設定"
  shape: rectangle
  tooltip: "若找不到 .aigne/doc-smith/config.yaml，將觸發互動式設定。"
}

propose_structure: {
  label: "分析專案並提出文件結構"
  shape: rectangle
}

review_structure: {
  label: "使用者審閱建議的結構"
  shape: rectangle
}

user_approve: {
  label: "批准結構？"
  shape: diamond
}

provide_feedback: {
  label: "提供回饋以完善結構"
  shape: rectangle
  tooltip: "使用者可以要求變更，例如重新命名、新增或移除章節。"
}

generate_content: {
  label: "為所有文件生成內容"
  shape: rectangle
}

end: {
  label: "結束"
  shape: oval
}

start -> run_command
run_command -> check_config
check_config -> interactive_setup: {
  label: "否"
}
interactive_setup -> propose_structure
check_config -> propose_structure: {
  label: "是"
}
propose_structure -> review_structure
review_structure -> user_approve
user_approve -> provide_feedback: {
  label: "否"
}
provide_feedback -> review_structure
user_approve -> generate_content: {
  label: "是"
}
generate_content -> end
```

## 逐步流程

若要產生您的文件，請在終端機中導覽至您專案的根目錄，並依照下列步驟操作。

### 1. 執行 Generate 指令

執行 `generate` 指令以開始此程序。工具將首先分析您專案的檔案與結構。

```bash 基本產生指令
aigne doc generate
```

為求簡潔，您也可以使用別名 `gen` 或 `g`。

### 2. 審閱文件結構

分析完成後，工具將顯示建議的文件結構，並提示您進行審閱：

```
Would you like to optimize the documentation structure?
❯ No, looks good
  Yes, optimize the structure (e.g. rename 'Getting Started' to 'Quick Start', move 'API Reference' before 'Configuration')
```

-   **不，看起來不錯**：選擇此選項可批准建議的結構，並直接進入內容產生階段。
-   **是的，最佳化結構**：選擇此選項可修改計畫。工具接著會以互動式循環徵詢您的回饋。您可以用純文字提供指令，例如：
    -   `新增一份名為「疑難排解」的文件`
    -   `移除「舊版功能」文件`
    -   `將「安裝」移至結構頂部`

    在每次回饋後，AI 將會修訂結構，您可以再次審閱。若要結束循環並批准最終結構，直接按下 Enter 鍵，不輸入任何回饋即可。

### 3. 內容產生

文件結構一經批准，DocSmith 將開始為計畫中的每份文件產生詳細內容。此過程會自動執行，其持續時間取決於您專案的規模與複雜度。

完成後，產生的檔案將儲存至您設定中指定的輸出目錄（例如 `./docs`）。

## 指令參數

`generate` 指令接受數個選用參數以控制其行為。

| 參數 | 說明 | 範例 |
|---|---|---|
| `--forceRegenerate` | 從頭開始重建所有文件，忽略任何現有的結構或內容。當您想要完全重置時，此選項非常有用。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 在互動式審閱開始前，提供初始的文字指令，以在結構產生階段指導 AI。 | `aigne doc generate --feedback "新增更多 API 範例"` |
| `--glossary` | 指定一個詞彙表檔案（例如 glossary.md），以確保在整個文件中術語使用的一致性。 | `aigne doc generate --glossary @/path/to/glossary.md` |

### 範例：強制完整重建

如果您想捨棄所有先前產生的文件，並根據您程式碼的當前狀態建立一套新的文件，請使用 `--forceRegenerate` 旗標。

```bash 強制重新產生
aigne doc generate --forceRegenerate
```

## 總結

`generate` 指令統籌了建立您初始專案文件的整個過程。它結合了自動化程式碼分析與互動式審閱流程，以產出一套結構化且相關的文件。

文件產生後，您可能會想：

-   [更新文件](./guides-updating-documentation.md)：對特定文件進行變更。
-   [翻譯文件](./guides-translating-documentation.md)：將您的內容翻譯成其他語言。
-   [發布您的文件](./guides-publishing-your-docs.md)：將您的文件發布上線。