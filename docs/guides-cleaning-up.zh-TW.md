# 清理

`aigne doc clear` 指令提供了一個直接的方法來移除生成的檔案、快取資料和配置設定。當您想要重設您的文件專案、從乾淨的狀態開始，或解決與過時或損壞檔案相關的問題時，這個指令非常有用。

## 互動式清理

使用此指令最簡單的方法是不帶任何參數直接執行：

```bash
aigne doc clear
```

執行此指令將啟動一個互動式提示，讓您精確選擇要移除的項目。這是大多數使用情境下的建議方法，因為它為每個選項提供了清晰的說明，並能防止意外的資料遺失。

## 清理目標

`clear` 指令可以移除幾種不同類型的資料。下表詳細說明了每個可用的目標、其功能以及它所影響的特定檔案或目錄。

| Target | 說明 | 受影響的檔案與目錄 |
| :--- | :--- | :--- |
| `generatedDocs` | 刪除您輸出目錄中所有已生成的檔案，但保留文件結構計畫。 | 您設定中 `docsDir` 所指定的目錄。 |
| `documentStructure` | 刪除所有已生成的檔案和文件結構計畫，有效地重設您的文件內容。 | `.aigne/doc-smith/output/structure-plan.json` 檔案和 `docsDir` 目錄。 |
| `documentConfig` | 刪除專案的設定檔。此操作後，您將需要重新執行 `aigne doc init`。 | `.aigne/doc-smith/config.yaml` 檔案。 |
| `authTokens` | 移除已儲存的發布網站授權權杖。系統將提示您選擇要清除哪些網站。 | 您家目錄中的 `~/.aigne/doc-smith-connected.yaml` 檔案。 |
| `deploymentConfig` | 從您的設定檔中刪除 `appUrl`。 | `.aigne/doc-smith/config.yaml` 檔案。 |

## 非互動式清理

對於自動化腳本或偏好使用命令列的使用者，您可以使用 `--targets` 旗標直接指定一個或多個要清除的目標。這將繞過互動式提示。

### 清除單一目標

若要僅清除已生成的檔案，請使用以下指令：

```bash
aigne doc clear --targets generatedDocs
```

### 清除多個目標

您可以提供多個目標名稱來一次清除多個項目。例如，若要同時移除文件設定和文件結構，請執行：

```bash
aigne doc clear --targets documentConfig documentStructure
```

清除您的設定後，您可以再次執行設定流程以重新開始。

---

有關初始設定的更多資訊，請參閱 [初始設定](./configuration-initial-setup.md) 指南。