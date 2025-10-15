# 管理歷史紀錄

AIGNE DocSmith 會按時間順序記錄對您文件所做的所有更新。此功能可讓您追蹤變更、檢視每次更新提供的回饋，並觀察文件隨時間的演變。本指南提供如何存取和解讀此歷史日誌的說明。

## 檢視更新歷史紀錄

若要檢視所有文件更新的日誌，請使用 `history view` 指令。此指令會為每個條目顯示一個精簡的單行摘要，其格式類似於版本控制日誌。

在您專案的根目錄中執行以下指令：

```bash 檢視歷史紀錄 icon=material-symbols:history
aigne history view
```

為方便起見，`history` 指令也支援 `view` 子指令的兩個別名：`log` 和 `list`。以下指令與上述指令等效，並會產生完全相同的輸出：

```bash
aigne history log
```

```bash
aigne history list
```

如果尚未進行任何更新，工具將顯示訊息：`No update history found`。

### 理解歷史紀錄輸出

`history view` 指令的輸出結構旨在以簡潔的格式提供每次更新的關鍵資訊。日誌中的每一行代表一個單獨的更新事件。

其格式由以下幾個部分組成：

| 元件 | 說明 |
| :--- | :--- |
| **簡短雜湊值** | 一個 8 個字元的唯一識別碼，由更新的時間戳記產生。此雜湊值是具確定性的，這意味著相同的時間戳記將永遠產生相同的雜湊值。 |
| **日期** | 一個相對時間戳記，表示更新發生的時間（例如，「5 分鐘前」、「2 天前」）。對於超過一週的條目，則會顯示具體日期。 |
| **操作** | 執行的動作類型，例如 `generate_document` 或 `update_document_detail`。 |
| **文件路徑** | 如果操作是針對單一檔案，則為被修改的特定文件路徑。為求清晰，此路徑會用括號括起來。 |
| **回饋** | 執行更新時提供的摘要訊息或回饋。 |

### 輸出範例

以下是執行 `aigne history view` 指令的範例輸出。此範例說明了不同的操作是如何被記錄在日誌中的。

```bash
📜 更新歷史紀錄

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

此日誌為您的文件修改歷史提供了一份清晰且有條理的紀錄，是追蹤進度與檢視過往變更的有效工具。