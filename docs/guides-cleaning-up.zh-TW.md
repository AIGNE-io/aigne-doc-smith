# 清理

本指南說明如何使用 `aigne doc clear` 指令，從您的專案中移除產生的檔案、設定檔和快取資料。此指令適用於重新開始或移除敏感資訊。

`clear` 指令可以以兩種模式執行：互動式和非互動式。不帶任何參數執行此指令將會啟動一個互動式精靈，引導您完成可用的清理選項。

## 指令用法

若要使用清理指令，請在您的終端機中執行以下指令：

```bash
aigne doc clear
```

或者，您也可以直接將一個或多個目標指定為參數，以非互動式方式執行指令。

```bash
aigne doc clear --targets <target1> <target2> ...
```

## 清理選項

當您執行不含參數的 `aigne doc clear` 指令時，系統會顯示一個互動式清單，列出要移除的項目。您可以一次選取多個項目進行清理。

可用的清理目標詳述如下。

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | 刪除輸出目錄（例如：`./docs`）中所有產生的文件檔案。此操作會保留文件結構檔案。 |
| **`documentStructure`** | 刪除所有產生的文件及文件結構檔案（例如：`.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 刪除主要專案設定檔（例如：`.aigne/doc-smith/config.yaml`）。您必須執行 `aigne doc init` 才能重新產生它。 |
| **`authTokens`** | 從檔案中刪除已儲存的授權權杖（例如：`~/.aigne/doc-smith-connected.yaml`）。系統會提示您選取要清除哪個網站的授權。 |
| **`deploymentConfig`** | 從文件設定檔中移除 `appUrl`，同時保留其他設定不變。 |
| **`mediaDescription`** | 刪除媒體檔案的快取 AI 生成描述（例如：來自 `.aigne/doc-smith/media-description.yaml`）。這些描述將在下次執行時重新產生。 |

## 範例

### 互動式清理

若要開始互動式清理過程，請執行不含任何參數的指令。這將會顯示一個清單，您可以使用空格鍵選取希望移除的項目，並按 Enter 鍵確認。

```bash
aigne doc clear
```

### 非互動式清理

若要直接清理特定項目，請提供其目標名稱作為參數。

#### 僅清理產生的文件

此指令會移除 `docs` 目錄，但會保留 `structure-plan.json` 檔案。

```bash
aigne doc clear --targets generatedDocs
```

#### 清理結構與設定檔

此指令會移除產生的文件、結構計畫以及設定檔。

```bash
aigne doc clear --targets documentStructure documentConfig
```

## 總結

`clear` 指令是一個管理專案狀態的工具。使用互動模式以獲得引導式流程，或直接指定目標以加快執行速度。由於這些操作是不可逆的，請確保在執行清理前已備份所有關鍵資料。