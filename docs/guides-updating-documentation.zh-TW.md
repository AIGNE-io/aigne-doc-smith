# 更新文件

維護文件的準確性和相關性是一個持續的過程。隨著專案的發展，更新文件的需求也會隨之增加。本指南提供了一個逐步修改現有文件的流程，無論您是需要整合使用者回饋、反映程式碼變更，還是完全重新生成某個部分。

`update` 指令是一個靈活的工具，既可以透過互動方式選擇文件，也可以使用命令列標誌以非互動方式應用特定變更。

## 透過互動式提示更新

使用 `update` 指令的預設方式是不帶任何參數執行它。這會啟動一個互動式會話，您可以在其中選擇一個或多個要修改的文件。

1.  在您的終端機中執行 `update` 指令：

    ```bash command aigne doc update icon=lucide:terminal
    aigne doc update
    ```

2.  該工具將顯示您現有文件的列表。使用方向鍵導覽，使用空格鍵選擇一個或多個文件，然後按 Enter 鍵確認。

    ![互動式文件更新提示的螢幕截圖，顯示可供選擇的文件列表。](../assets/screenshots/doc-update.png)

接下來的步驟取決於您選擇了多少份文件。

### 精修單一文件

如果您只選擇一份文件，您將進入一個迭代審閱循環。此模式非常適合對單一檔案進行精確修改。您將看到以下選項：
*   **檢視文件**：直接在您的終端機中顯示文件當前版本的全部內容以供審閱。
*   **提供回饋**：提示您輸入關於您希望更改內容的文字回饋。例如，「簡化配置過程的說明」或「為常見錯誤新增疑難排解部分」。
*   **完成**：退出互動式會話並儲存文件的最新版本。

在您提供回饋後，該工具會重新生成文件。然後您可以檢視變更並提供更多回饋。這個循環可以重複進行，直到文件符合您的要求。

### 更新多份文件

如果您選擇多份文件，該工具將執行批次更新。系統會提示您提供單一回饋，該回饋將應用於所有選定的文件。這對於一次在多個檔案中進行一致的變更非常有用，例如統一術語或更新通用部分。

## 透過命令列標誌直接更新

直接更新專為無需互動式審閱循環即可進行變更而設計。當您確切知道需要進行哪些變更並希望直接應用它們時，這種方法非常有用。

### 使用特定回饋進行更新

您可以直接從命令列提供回饋以更新一份或多份文件。這會繞過互動式會話並立即應用變更。

使用 `--docs` 標誌指定文件的路徑，並使用 `--feedback` 標誌提供您的指示。

```bash command aigne doc update with feedback icon=lucide:terminal
aigne doc update --docs overview.md --feedback "Add a more detailed explanation of the core features."
```

要更新多個文件，只需提供多個 `--docs` 標誌：

```bash command aigne doc update multiple docs icon=lucide:terminal
aigne doc update --docs overview.md --docs getting-started.md --feedback "Ensure the tone is consistent across both documents."
```

### 重設文件內容

在某些情況下，您可能希望捨棄文件的當前版本，並根據最新的原始碼從頭開始重新生成。`--reset` 標誌指示工具完全忽略現有內容。

```bash command aigne doc update with reset icon=lucide:terminal
aigne doc update --docs overview.md --reset
```

當文件因底層程式碼的重大變更而變得嚴重過時時，此指令非常有用。



## 指令參數

`update` 指令接受多個參數以控制其行為。以下是可用選項的摘要：

| 參數 | 說明 | 範例 |
| :--------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| `--docs` | 指定要更新的一個或多個文件的路徑。可多次使用以指定多個檔案。 | `--docs overview.md` |
| `--feedback` | 提供對指定文件進行變更的文字指示。 | `--feedback "Clarify the installation steps."` |
| `--reset` | 一個布林標誌，存在時會使文件從頭開始重新生成。 | `--reset` |
| `--glossary` | 指定詞彙表檔案的路徑，以確保在更新過程中術語的一致性。 | `--glossary @/path/to/glossary.md` |