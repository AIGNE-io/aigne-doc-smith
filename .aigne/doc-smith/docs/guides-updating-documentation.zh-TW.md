# 更新文件

需要快速修改或徹底修改文件嗎？本指南將說明如何使用 `update` 指令來修改現有文件，無論您是要整合新的回饋、反映程式碼變更，還是從頭開始。此工具提供互動模式以進行引導式變更，也提供直接模式以進行快速的命令列更新。

## 互動式更新

若想獲得引導式體驗，請在不帶任何參數的情況下執行 `update` 指令。這將啟動一個互動式會話，您可以在其中選擇要變更的文件並提供說明。

1.  開始互動式更新流程：
    ```bash aigne doc update icon=lucide:terminal
    aigne doc update
    ```
2.  您將看到專案中的文件列表。使用方向鍵移動，使用空白鍵選擇一個或多個檔案，然後按 `Enter` 確認您的選擇。

    ![顯示互動式提示的螢幕截圖，使用者可以從列表中選擇要更新的文件。](../../../assets/screenshots/doc-update.png)

接下來的流程取決於您是選擇單一文件還是多個文件。

### 精修單一文件

當您選擇一份文件時，您會進入一個為進行精確調整而設計的迭代精修循環。您將看到一組選項：

*   **View document**：直接在您的終端機中顯示文件內容的當前版本。
*   **Give feedback**：提示您輸入文字以描述您想要的變更。例如，「為非技術使用者簡化介紹」或「為身份驗證函式新增一個程式碼範例」。
*   **Done**：退出精修循環並儲存文件的最新版本。

在您提交回饋後，工具會重新生成文件內容。然後您可以查看新版本並提供更多回饋，重複此循環直到您對結果感到滿意為止。

### 批次更新多個文件

如果您選擇兩個或更多文件，工具會執行批次更新。系統將提示您提供單一指令或一則回饋。此回饋將同時應用於所有選定的文件。當您需要在整個文件中進行一致的變更時，例如更新一個重複出現的章節或標準化術語，此方法非常有效。

## 使用命令列旗標直接更新

當您已經知道需要進行哪些變更時，可以使用命令列旗標直接更新文件，從而跳過互動式提示。

### 應用特定回饋

若要將回饋應用於一個或多個文件，請使用 `--docs` 和 `--feedback` 旗標。`--docs` 旗標指定檔案路徑，而 `--feedback` 則提供更新的說明。

```bash Update a single document icon=lucide:terminal
aigne doc update --docs /overview --feedback "Add a more detailed explanation of the core features."
```

您可以多次指定 `--docs` 旗標，以在一個指令中將相同的回饋應用於多個文件。

```bash Update multiple documents icon=lucide:terminal
aigne doc update --docs /overview --docs /getting-started --feedback "Ensure the tone is consistent across both documents."
```

### 重設文件

若要捨棄文件的當前版本並從原始碼重新生成它，請使用 `--reset` 旗標。此操作會告訴工具忽略現有內容，並從頭開始建立文件。

```bash Reset a document icon=lucide:terminal
aigne doc update --docs /overview --reset
```

當文件因專案程式碼庫的重大變更而嚴重過時時，此功能特別有用。

## 指令參數

`update` 指令接受數個參數來控制其行為。以下是可用選項的摘要：

| 參數 | 說明 | 必要 |
| :--- | :--- | :--- |
| `--docs` | 指定要更新文件之路徑。可多次使用。 | 選用 |
| `--feedback` | 提供要對指定文件進行變更的文字說明。 | 選用 |
| `--reset` | 一個布林旗標，當存在時，會從頭開始重新生成文件，忽略現有內容。 | 選用 |
| `--glossary` | 指定詞彙表檔案的路徑（`@/path/to/glossary.md`），以確保術語的一致性。 | 選用 |

---

透過這些方法，您可以有效地管理您的文件，使其保持準確並與您的專案開發保持一致。有關首次建立文件的資訊，請參閱[生成文件](./guides-generating-documentation.md)指南。
