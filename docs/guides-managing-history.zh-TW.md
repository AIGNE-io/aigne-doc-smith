# 管理歷史記錄

AIGNE DocSmith 會按時間順序記錄您對文件所做的所有更新。此功能可讓您追蹤變更、檢視每次更新提供的回饋，並觀察文件隨時間的演變。本指南將說明如何存取和解讀此歷史記錄。

## 檢視更新歷史記錄

若要檢視所有文件更新的記錄，請使用 `aigne doc history view` 指令。此指令會為每個項目顯示一行精簡的摘要，其格式類似於版本控制記錄。

在您的專案根目錄中執行以下指令：

```bash 檢視歷史記錄 icon=material-symbols:history
aigne doc history view
```

為了方便起見，`doc history` 指令也支援 `view` 子指令的兩個別名：`log` 和 `list`。以下指令與上述指令等效，並會產生完全相同的輸出：

```bash
aigne doc history log
```

```bash
aigne doc history list
```

如果尚未進行任何更新，工具將顯示訊息：`No update history found`。

### 理解歷史記錄輸出

`aigne doc history view` 指令的輸出結構經過精心設計，能以精簡的格式提供每次更新的關鍵資訊。記錄中的每一行都代表一個單獨的更新事件。

其格式由以下幾個部分組成：

| 元件 | 說明 |
| :--- | :--- |
| **簡短雜湊值** | 一個 8 個字元的唯一識別碼，根據更新的時間戳記產生。此雜湊值是確定性的，這意味著相同的時間戳記將始終產生相同的雜湊值。 |
| **日期** | 一個相對時間戳記，表示更新發生的時間（例如，「5 分鐘前」、「2 天前」）。對於超過一週的項目，則會顯示具體日期。 |
| **操作** | 執行的操作類型，例如 `generate_document` 或 `update_document_detail`。 |
| **文件路徑** | 如果操作是針對單一檔案，則顯示被修改的特定文件路徑。為清楚起見，此路徑會用括號括起來。 |
| **回饋** | 執行更新時提供的摘要訊息或回饋。 |

### 輸出範例

以下是執行 `aigne doc history view` 指令的範例輸出。此範例說明了不同的操作是如何被記錄在日誌中的。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

此記錄為您的文件修改歷程提供了一個清晰有序的記錄，是追蹤進度和檢視過去變更的有效工具。