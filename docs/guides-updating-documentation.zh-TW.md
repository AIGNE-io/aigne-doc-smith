# 更新文件

維持文件的準確性與關聯性是一項持續性的工作。隨著專案的發展，更新文件的需求也會隨之增加。本指南提供修改現有文件的逐步流程，無論您需要整合使用者回饋、反映程式碼變更，還是完全重新生成某個章節，都能從中找到指引。

`update` 指令為此提供了兩種主要模式：用於修改單一文件的互動模式，以及用於將變更應用於多個文件或重設內容的批次模式。

## 互動式文件更新

互動模式非常適合對單一文件進行迭代式變更。它讓您可以提供回饋、檢視更新後的內容，並持續完善直到您對結果感到滿意為止。當您執行指令而未指定特定文件時，此為預設模式。

若要開始互動式更新工作階段，請遵循以下步驟：

1.  在您的終端機中執行 `update` 指令：

    ```bash aigne doc update 指令 icon=lucide:terminal
    aigne doc update
    ```

2.  該工具將顯示您現有文件的列表。使用方向鍵選擇您想修改的文件，然後按下 Enter 鍵。

    ![互動式文件更新提示的螢幕截圖，顯示可供選擇的文件列表。](https://docsmith.aigne.io/image-bin/uploads/6e088d8b4e724ef383b149b5c2a38116.png)

3.  選擇文件後，您將進入一個包含以下選項的檢視循環：
    *   **View document**：直接在您的終端機中顯示文件當前版本的完整內容以供檢視。
    *   **Give feedback**：提示您輸入您想變更內容的文字回饋。例如，「簡化設定流程的說明」或「為常見錯誤新增疑難排解章節」。
    *   **Done**：退出互動式工作階段並儲存文件的最新版本。

4.  在您提供回饋後，工具將重新生成文件內容。接著您可以檢視變更，並在需要時提供更多回饋。此循環可以重複進行，直到文件符合您的要求為止。

## 批次文件更新

批次模式專為進行非互動式變更而設計。當您確切知道需要進行哪些變更並希望直接應用，或者當您需要同時更新多個文件時，此模式非常有用。

### 使用特定回饋更新

您可以直接從命令列提供回饋，以更新一份或多份文件。這會繞過互動式工作階段，並立即應用變更。

使用 `--docs` 旗標指定文件路徑，並使用 `--feedback` 旗標提供您的指示。

```bash 使用回饋執行 aigne doc update 指令 icon=lucide:terminal
aigne doc update --docs /guides/overview.md --feedback "Add a more detailed explanation of the core features."
```

若要更新多個文件，只需提供多個 `--docs` 旗標：

```bash 更新多個文件的 aigne doc update 指令 icon=lucide:terminal
aigne doc update --docs /guides/overview.md --docs /guides/getting-started.md --feedback "Ensure the tone is consistent across both documents."
```

### 重設文件內容

在某些情況下，您可能會想捨棄文件的當前版本，並根據最新的原始碼從頭開始重新生成。`--reset` 旗標會指示工具完全忽略現有內容。

```bash 使用重設執行 aigne doc update 指令 icon=lucide:terminal
aigne doc update --docs /guides/overview.md --reset
```

當文件因底層程式碼的重大變更而變得嚴重過時時，此指令非常有用。

## 指令參數

`update` 指令接受數個參數以控制其行為。以下是可用選項的摘要：

| 參數  | 說明                                                                                             | 範例                                                  |
| :--------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| `--docs`   | 指定要更新的文件路徑。可多次使用以指定多個檔案。 | `--docs /overview.md`                                    |
| `--feedback` | 提供對指定文件進行變更的文字指示。                  | `--feedback "Clarify the installation steps."`           |
| `--reset`  | 一個布林旗標，存在時會使文件從頭開始重新生成。                  | `--reset`                                                |
| `--glossary` | 指定詞彙表檔案的路徑，以確保在更新過程中術語的一致性。       | `--glossary @/path/to/glossary.md`                       |