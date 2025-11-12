# 管理歷史紀錄

曾經想知道您的文件在何時做了哪些變更嗎？AIGNE DocSmith 會為每一次更新保留詳細的日誌。本指南將向您展示如何存取和讀取此歷史紀錄，以便您能輕鬆追蹤文件的演進過程。

## 檢視更新歷史紀錄

要查看所有文件的更新日誌，您可以使用 `history view` 指令。此指令會為每次變更提供一個精簡的單行摘要，就像版本控制系統的日誌一樣。

請在您專案的根目錄下執行以下指令：

```bash 檢視歷史紀錄日誌 icon=lucide:history
aigne doc history view
```

### 指令別名

為了方便起見，`history` 指令為 `view` 子指令提供了兩個別名：`log` 和 `list`。這些指令執行完全相同的功能，並會產生完全相同的輸出。

您可以使用以下任一指令作為捷徑：

```bash
aigne doc history log
```

```bash
aigne doc history list
```

如果您尚未進行任何更新，該工具將會顯示以下訊息通知您：`No update history found`。

## 理解歷史紀錄輸出

`history` 指令的輸出旨在讓您能一目了然地清晰概覽每次更新。日誌中的每一行都代表一個單一的更新事件。

每個條目的格式分解如下：

| 元件 | 說明 |
| :--- | :--- |
| **短雜湊值 (Short Hash)** | 一個由更新時間戳產生的獨特 8 字元識別碼。此雜湊值是確定性的，意即相同的時間戳永遠會產生相同的雜湊值。 |
| **日期 (Date)** | 一個相對時間戳，顯示更新發生的時間（例如：「5 分鐘前」、「2 天前」）。對於超過一週的條目，則會顯示具體日期。 |
| **操作 (Operation)** | 所執行的動作類型，例如 `generate_document` 或 `update_document_detail`。 |
| **文件路徑 (Document Path)** | 如果操作是針對單一檔案，則會顯示被修改文件的路徑。為求清晰，此路徑會以括號顯示。 |
| **回饋 (Feedback)** | 進行更新時所提供的摘要或回饋訊息。 |

### 輸出範例

以下是您執行 `aigne doc history view` 指令時可能會看到的範例。此範例展示了不同類型的更新是如何被記錄在日誌中的。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial creation of the history management guide.
```

此日誌提供了一份井然有序且易於掃視的所有變更記錄，使其成為追蹤進度和檢視文件歷史的實用工具。
