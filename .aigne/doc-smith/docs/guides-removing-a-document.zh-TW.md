# 移除文件

要確保您的文件準確無誤，不僅需要新增內容，還需要進行整理。本指南詳細介紹如何使用 `aigne doc remove-document` 命令安全地從專案中刪除文件，以確保您的文件集保持整潔和相關性。

## 總覽

`remove-document` 命令提供了一種互動式的方式，讓您從現有結構中選擇並刪除一個或多個文件。此命令的一個關鍵功能是它能夠處理連鎖刪除；移除父文件也會同時移除其所有子文件。

此外，在選定的文件被移除後，該工具會自動掃描剩餘的檔案，找出任何指向已刪除文件的失效連結。然後，它會嘗試智慧地修復或移除這些連結，確保您整個文件集的完整性。

## 命令用法

要開始移除程序，請導覽至您的專案根目錄並執行以下命令：

```sh icon=lucide:terminal
aigne doc remove-document
```

您也可以使用較短的別名 `remove` 或 `rm`：

```sh icon=lucide:terminal
aigne doc rm
```

### 1. 選擇並確認文件

執行命令後，您將看到目前文件的列表，以階層樹狀結構顯示。您可以使用方向鍵在此列表中導覽，並透過按下空白鍵來選擇要移除的文件。選定所有要刪除的文件後，按下 `Enter` 鍵進行確認。如果您決定不移除任何文件，可以在未選擇任何項目的情況下按下 `Enter` 來取消操作。

```sh 選取要移除的文件 icon=lucide:terminal
? Select documents to remove (Press Enter with no selection to finish):
❯◯ /overview
 ◯ /getting-started
 ◯ /guides
  ◯ /guides/generating-documentation
  ◯ /guides/updating-documentation
   ◉ /guides/updating-documentation/adding-a-document
   ◉ /guides/updating-documentation/removing-a-document
```

### 2. 連結驗證與修復

文件刪除後，DocSmith 會自動掃描您剩餘的文件，尋找任何現在指向不存在檔案的連結。系統將提示您確認自動修復這些無效連結。

```sh 確認連結修復 icon=lucide:terminal
? Select documents with invalid links to fix (all selected by default, press Enter to confirm, or unselect all to skip):
❯◉ Update Document (/guides/updating-documentation.md) - Invalid Links(2): /guides/adding-a-document, /guides/removing-a-document
```

### 3. 檢視摘要

最後，您的終端機中會顯示一份摘要，列出所有成功移除的文件，並詳細說明哪些文件中的無效連結已被修復。

```sh 移除摘要 icon=lucide:terminal
---
📊 Summary

🗑️  Removed Documents:
   Total: 2 document(s)

   1. /guides/adding-a-document
   2. /guides/removing-a-document

✅ Documents fixed (Removed invalid links):
   Total: 1 document(s)

   1. /guides/updating-documentation
      Invalid links fixed: /guides/adding-a-document, /guides/removing-a-document
```

此流程確保了移除檔案的過程簡單明瞭，並且不會在您的其他文件中留下失效的引用。

## 相關指南

整理好您的文件後，您可能需要進行其他更新。有關管理文件結構的更多資訊，請參閱以下指南：

<x-cards data-columns="2">
  <x-card data-title="新增文件" data-icon="lucide:file-plus" data-href="/guides/adding-a-document">
    了解如何將新文件新增到您現有的文件結構中。
  </x-card>
  <x-card data-title="更新文件" data-icon="lucide:file-pen-line" data-href="/guides/updating-document">
    查看如何修改現有文件的內容。
  </x-card>
</x-cards>