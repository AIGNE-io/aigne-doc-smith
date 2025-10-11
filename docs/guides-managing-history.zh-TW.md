# 管理歷史記錄

AIGNE DocSmith 會按時間順序記錄您對文件所做的所有更新。此功能可讓您追蹤變更、檢視更新期間提供的回饋，並了解文件隨時間的演變。本指南將說明如何存取和解讀此歷史記錄。

## 檢視更新歷史記錄

若要檢視所有文件更新的日誌，您可以使用 `history view` 指令。此指令會為每個條目顯示一個精簡的單行摘要，類似於版本控制日誌。

在您的終端機中執行以下指令：

```bash 檢視歷史記錄 icon=material-symbols:history
aigne history view
```

`history` 指令也支援 `view` 子指令的兩個別名：`log` 和 `list`。以下指令是等效的，並會產生相同的輸出：

```bash
aigne history log
```

```bash
aigne history list
```

### 了解歷史記錄輸出

`history view` 指令的輸出格式旨在讓您能一目了然地獲取每次更新的關鍵資訊。每一行代表一個單獨的更新條目。

以下是格式的詳細說明：

| 元件 | 說明 |
| :--- | :--- |
| **短雜湊值** | 從更新時間戳記產生的 7 個字元唯一識別碼。 |
| **日期** | 一個相對時間戳記，表示更新發生的時間（例如，「5 minutes ago」、「2 days ago」）。對於較舊的條目，則會顯示具體日期。 |
| **操作** | 執行的操作類型，例如 `generate-document` 或 `update-document-detail`。 |
| **文件路徑** | 如果操作針對單一檔案，則為被修改的特定文件路徑。此路徑會用括號括起來。 |
| **回饋** | 進行更新時所提供的回饋或摘要訊息。 |

### 範例

以下是執行 `aigne history view` 指令的範例輸出。

```bash
📜 Update History

e5a4f8b 2 hours ago update-document-detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d 1 day ago  update-document-detail (/overview): Refined the introduction to be more concise.
f8d2e0c 3 days ago generate-document (/guides/managing-history): Initial generation of the history management guide.
```

此日誌提供了您文件修改歷史的清晰有序記錄，對於追蹤進度和檢視過去的變更非常有用。