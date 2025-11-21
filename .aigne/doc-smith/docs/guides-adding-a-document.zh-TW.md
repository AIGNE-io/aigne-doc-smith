是否曾發現您的文件有所欠缺？`aigne doc add-document` 指令提供了一種直接、互動的方式，可將新主題引入您現有的文件結構中，確保您的內容與專案一同成長。

# 新增文件

`aigne doc add-document` 指令，也可透過別名 `aigne doc add` 使用，會啟動一個互動式會話，將一份或多份新文件新增至您專案的文件結構中。它不僅會新增新檔案，還會智慧地更新現有文件，加入相關連結，以確保新內容可被發現。

## 指令用法

若要開始此流程，請導覽至您專案的根目錄並執行以下指令：

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

此指令會啟動一個互動式精靈，引導您完成整個過程。

## 流程

此指令遵循一個結構化的、按部就班的流程，以無縫整合新文件。

### 1. 初始提示

該指令首先會顯示目前的文件結構，然後提示您指定要新增的新文件。您可以使用自然語言描述您的請求。

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish:
```

### 2. 新增文件

您可以逐一新增文件。每次新增後，工具會顯示更新後的結構，並提示您新增另一份文件。若要完成新增文件，只需直接按 `Enter` 鍵，無需輸入任何內容。

```sh
You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 3. 自動連結分析

當您完成新增文件後，DocSmith 會分析新增的內容和現有內容。它會識別出哪些現有文件可以從連結到您剛新增的文件中獲益。

### 4. 檢視並確認更新

DocSmith 會列出它建議更新以加入新連結的現有文件。您可以檢視此列表並選擇您希望工具修改哪些文件。此步驟確保您對現有內容的變更有完全的控制權。

![文件更新選擇畫面的螢幕截圖。](../../../assets/screenshots/doc-update.png)

### 5. 內容生成與翻譯

確認後，系統將並行執行兩項主要任務：
*   **生成內容：** 為您新增的文件建立完整內容。
*   **更新連結：** 修改所選的現有文件，以包含指向新頁面的連結。

如果您已設定多種語言，新文件和更新後的文件都會自動加入翻譯佇列。

### 6. 總結報告

最後，該指令會印出所執行操作的總結。此報告包含所有新建立文件的列表，以及所有已更新並加入新連結的現有文件的列表。

```text
📊 Summary

✨ Added Documents:
   Total: 1 document(s)

   1. /guides/deployment-guide - Deployment Guide

✅ Documents updated (Added new links):
   Total: 2 document(s)

   1. /overview - Overview
      New links added: /guides/deployment-guide

   2. /getting-started - Getting Started
      New links added: /guides/deployment-guide
```

這個結構化的流程確保新文件不僅被建立，還能融入您現有內容的結構中，從而改善導覽和可發現性。