# 管理歷史紀錄

AIGNE DocSmith 會按時間順序記錄您對文件所做的所有更新。此功能可讓您追蹤變更、檢閱更新期間提供的回饋，並了解文件隨時間的演變過程。本指南將說明如何存取和解讀此歷史紀錄。

## 查看更新歷史紀錄

若要查看所有文件的更新日誌，您可以使用 `history view` 指令。此指令會為每個項目顯示精簡的單行摘要，類似於版本控制的日誌。

在您的終端機中執行以下指令：

```bash 查看歷史紀錄 icon=material-symbols:history
aigne history view
```

`history` 指令也支援 `view` 子指令的兩個別名：`log` 和 `list`。以下指令是等效的，將會產生相同的輸出：

```bash
aigne history log
aigne history list
```

### 了解歷史紀錄輸出

`history view` 指令的輸出格式旨在讓您能一目了然地獲取每次更新的關鍵資訊。每一行代表一個單獨的更新項目。

以下是其格式的詳細說明：

| 元件 | 說明 |
| :--- | :--- |
| **簡短雜湊值** | 一個從更新時間戳產生的 8 字元唯一識別碼。 |
| **日期** | 一個相對時間戳，表示更新發生的時間（例如，「5 分鐘前」、「2 天前」）。對於較舊的項目，則會顯示具體日期。 |
| **操作** | 執行的操作類型，例如 `generate_document` 或 `update_document_detail`。 |
| **文件路徑** | 如果操作針對的是單一檔案，則為被修改的特定文件的路徑。此路徑會用括號括起來。 |
| **回饋** | 進行更新時所提供的回饋或摘要訊息。 |

### 範例

以下是執行 `aigne history view` 指令的範例輸出。

```bash
📜 更新歷史紀錄

e5a4f8b1 2 小時前 update_document_detail (/guides/generating-documentation): 新增了關於進階設定選項的新章節。
a3b1c9d2 1 天前  update_document_detail (/overview): 修訂了簡介，使其更加簡潔。
f8d2e0c3 3 天前 generate_document (/guides/managing-history): 初次產生歷史紀錄管理指南。
```

此日誌提供了您文件修改歷史的清晰有序記錄，有助於追蹤進度和檢閱過去的變更。