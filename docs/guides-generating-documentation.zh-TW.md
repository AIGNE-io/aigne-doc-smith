# 產生文件

本指南提供了一套系統化程序，說明如何從專案的原始檔案建立完整文件。此流程使用 `aigne doc generate` 命令啟動，該命令會分析您的程式碼庫、提出邏輯結構，然後為每份文件撰寫內容。

此命令是初次建立您文件的主要工具。若要在文件建立後進行修改，請參閱 [更新文件](./guides-updating-documentation.md) 指南。

### 產生工作流程

`generate` 命令會執行一系列自動化步驟來建立您的文件。此過程設計為互動式，讓您能在內容寫入前，審查並核准建議的結構。

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
  label: "使用者審查建議的結構"
  shape: rectangle
}

user_approve: {
  label: "核准結構？"
  shape: diamond
}

provide_feedback: {
  label: "提供回饋以完善結構"
  shape: rectangle
  tooltip: "使用者可以要求變更，例如重新命名、新增或移除章節。"
}

generate_content: {
  label: "為所有文件產生內容"
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

若要產生您的文件，請在您的終端機中導覽至專案的根目錄，並遵循以下步驟。

### 1. 執行 Generate 命令

執行 `generate` 命令以開始此流程。該工具將首先分析您專案的檔案和結構。

```bash 基本產生命令
aigne doc generate
```

您也可以使用別名 `gen` 或 `g` 以求簡潔。

### 2. 審查文件結構

分析完成後，該工具將呈現一個建議的文件結構。此結構是將要建立的各份文件的一個階層式規劃。

系統會提示您審查此計畫：

```
您想最佳化文件結構嗎？
您可以編輯標題、重組章節。
❯ 看起來不錯 - 繼續使用目前結構
  是，最佳化結構
```

-   **看起來不錯 - 繼續使用目前結構**：選擇此選項以核准建議的結構，並直接進入內容產生階段。
-   **是，最佳化結構**：如果您希望修改計畫，請選擇此選項。您將能夠以純文字形式提供回饋，例如「將『API』重新命名為『API 參考』」或「新增一個『部署』的章節」。AI 將根據您的回饋修訂結構，您可以再次審查。此循環可以重複進行，直到結構符合您的要求。

### 3. 內容產生

文件結構一經核准，DocSmith 將開始為計畫中的每份文件產生詳細內容。此過程會自動執行，其持續時間取決於您專案的規模與複雜度。

完成後，產生的檔案將儲存至您設定中指定的輸出目錄（例如 `./docs`）。

## 命令參數

`generate` 命令接受數個可選參數來控制其行為。

| 參數 | 說明 | 範例 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `--forceRegenerate` | 從頭開始重建所有文件，忽略任何現有的結構或內容。這在您想從頭開始時很有用。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 提供初始指令，以在結構產生階段指導 AI。 | `aigne doc generate --feedback "新增更多 API 範例和疑難排解章節"` |
| `--glossary` | 指定一個詞彙表檔案（`.md`），以確保在整個文件中術語使用的一致性。 | `aigne doc generate --glossary @/path/to/glossary.md` |

### 範例：強制完全重建

如果您想捨棄所有先前產生的文件，並根據您程式碼的目前狀態建立一套新的文件，請使用 `--forceRegenerate` 旗標。

```bash 強制重新產生
aigne doc generate --forceRegenerate
```

## 總結

`generate` 命令統籌了建立您初始專案文件的整個流程。它結合了自動化程式碼分析與互動式審查流程，以產出一套結構化且相關的文件。

文件產生後，您可能會想：

-   [更新文件](./guides-updating-documentation.md)：對特定文件進行變更。
-   [翻譯文件](./guides-translating-documentation.md)：將您的內容翻譯成其他語言。
-   [發佈您的文件](./guides-publishing-your-docs.md)：將您的文件發佈到網路上。