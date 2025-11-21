是否曾發現您的文件有所欠缺？`aigne doc add-document` 指令提供了一種直接、互動的方式，可將新主題引入您現有的文件結構中，確保您的內容與專案一同成長。

# 新增文件

`aigne doc add-document` 指令（也可透過別名 `aigne doc add` 使用）會啟動一個互動式對話，將一份或多份新文件新增至您專案的文件結構中。它不僅會新增檔案，還會智慧地更新現有文件，加入相關連結，以確保新內容可被找到。

## 指令用法

若要開始此程序，請導覽至您專案的根目錄並執行以下指令：

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

此指令會啟動一個互動式精靈，引導您完成整個過程。

## 流程

此指令遵循一個結構化的分步流程，以無縫整合新文件。

### 1. 互動式新增文件

指令會先顯示目前的文件結構，然後提示您指定新文件。您可以用自然語言描述您的請求。您可以逐一新增文件。每次新增後，工具會顯示更新後的結構並提示您新增另一份文件。若要完成新增文件，只需直接按下 `Enter` 鍵，無需輸入任何內容。

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 2. 審查並連結至現有文件

當您完成新增文件後，DocSmith 會分析現有內容，並找出哪些文件可以從連結至新文件中受益。然後，它會呈現這些文件的清單，您可以審查並選擇希望工具修改哪些文件。此步驟讓您完全掌控對現有內容的變更。

![文件更新選擇畫面的螢幕截圖。](../../../assets/screenshots/doc-update.png)

### 3. 內容生成與翻譯

確認後，系統會並行進行兩項主要任務：
*   **生成內容：** 為您新增的文件建立完整內容。
*   **更新連結：** 修改所選的現有文件，以包含指向新頁面的連結。

如果您設定了多種語言，新文件和更新後的文件都會自動加入翻譯佇列。

### 4. 摘要報告

最後，指令會印出所執行操作的摘要。此報告包含所有新建立文件的清單，以及所有已更新並加入新連結的現有文件清單。

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