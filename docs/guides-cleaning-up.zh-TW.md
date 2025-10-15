# 清理

`aigne doc clear` 指令提供了一種系統化的方法，可從您的專案中移除產生的檔案、快取資料和組態設定。當您需要重設文件工作區、從乾淨的狀態開始，或解決可能由過期檔案引起的問題時，這是一個實用的步驟。

## 互動式清理

為了進行受控且精確的清理，建議的程序是不帶任何參數執行此指令。

```bash
aigne doc clear
```

此操作會啟動一個互動式提示，列出所有可用的清理選項。每個選項都會附有清晰的功能說明，讓您可以選擇要移除的確切項目。這種互動式方法可以防止意外刪除重要資料。

## 清理選項

`clear` 指令可以移除數種不同類型的資料。下表詳細說明了每個可用選項、其功能以及所影響的特定檔案或目錄。

| 選項 | 說明 | 受影響的檔案和目錄 |
| :--- | :--- | :--- |
| `generatedDocs` | 刪除位於輸出目錄中的所有已產生文件。文件結構計畫將被保留。 | 您組態中由 `docsDir` 指定的目錄。 |
| `documentStructure` | 刪除所有已產生的文件和文件結構計畫。此操作會重設所有文件內容。 | `.aigne/doc-smith/output/structure-plan.json` 檔案和 `docsDir` 目錄。 |
| `documentConfig` | 刪除專案的組態檔。執行此操作後，必須執行 `aigne doc init` 來建立新的組態。 | `.aigne/doc-smith/config.yaml` 檔案。 |
| `authTokens` | 移除已儲存的發布網站授權權杖。系統將提示您選擇要清除哪些網站的授權。 | 位於您家目錄中的 `~/.aigne/doc-smith-connected.yaml` 檔案。 |
| `deploymentConfig` | 僅從您的組態檔中移除 `appUrl` 設定，其他設定保持不變。 | `.aigne/doc-smith/config.yaml` 檔案。 |
| `mediaDescription` | 刪除媒體檔案的 AI 生成快取描述。這些描述將在下次建置文件時重新生成。 | `.aigne/doc-smith/cache/media-description.json` 檔案。 |

## 非互動式清理

對於在自動化腳本中使用，或偏好直接進行命令列操作的使用者，您可以使用 `--targets` 旗標指定一個或多個清理目標。這會繞過互動式提示，並立即執行清理。

### 清理單一選項

若要僅移除已產生的文件，請執行以下指令：

```bash
aigne doc clear --targets generatedDocs
```

### 清理多個選項

您可以提供一個以空格分隔的目標名稱列表，以一次移除多個項目。例如，若要同時刪除文件組態和文件結構，請執行以下指令：

```bash
aigne doc clear --targets documentConfig documentStructure
```

清除組態後，您可以開始新的設定流程。

---

關於建立新組態的詳細說明，請參閱 [初始設定](./configuration-initial-setup.md) 指南。