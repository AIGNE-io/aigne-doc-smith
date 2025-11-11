# 清理

需要重設專案或移除敏感資料嗎？本指南將說明如何使用 `aigne doc clear` 指令來安全地移除產生的檔案、組態設定和快取資訊，幫助您維持一個乾淨且有條理的工作區。

`clear` 指令提供兩種模式：用於引導式清理的互動式精靈，以及用於快速、特定操作的非互動式模式。

## 指令用法

若要開始清理流程，請在您專案的根目錄中執行以下指令：

```sh aigne doc clear icon=lucide:trash-2
aigne doc clear
```

在不帶任何參數的情況下執行此指令會啟動一個互動式精靈，它將提示您選取希望移除的項目。

若要進行更快速的非互動式清理，您可以使用 `--targets` 旗標直接指定一個或多個目標。

```sh aigne doc clear --targets generatedDocs icon=lucide:trash-2
aigne doc clear --targets <target1> <target2>
```

## 清理選項

互動式精靈會顯示一份您可以移除的項目清單。下表詳細說明了每個可用選項，這些選項也可以在非互動式模式中作為目標使用。

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | 允許您從輸出目錄（例如 `./docs`）中選取並刪除特定的已產生文件。整體文件結構將被保留。 |
| **`documentStructure`** | 刪除所有已產生的文件檔案和結構計畫檔案（例如 `.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 移除主要的專案組態檔（例如 `.aigne/doc-smith/config.yaml`）。刪除後，您需要執行 `aigne doc init` 來建立一個新的組態檔。 |
| **`authTokens`** | 刪除用於發布的已儲存授權憑證（例如，來自 `~/.aigne/doc-smith-connected.yaml`）。系統將提示您選取要清除哪些網站的授權。 |
| **`deploymentConfig`** | 僅從您的專案組態檔中移除 `appUrl` 金鑰，保留所有其他設定不變。 |
| **`mediaDescription`** | 刪除專案媒體檔案的 AI 產生描述快取（例如 `.aigne/doc-smith/media-description.yaml`）。這些描述將在下次需要時自動重新產生。 |

## 範例

### 互動式清理

若要獲得引導式體驗，請在不帶任何參數的情況下執行此指令。您將看到一個核對清單。使用方向鍵導覽，使用空白鍵選取或取消選取項目，並按 Enter 鍵確認您的選擇以繼續清理。

```sh aigne doc clear icon=lucide:mouse-pointer-click
aigne doc clear
```

### 非互動式清理

若要無提示地清除特定項目，請使用 `--targets` 旗標，後面跟著您希望移除的目標名稱。

#### 僅清除已產生的文件

此指令會刪除已產生的文件檔案，但保留 `structure-plan.json` 檔案，讓您之後可以重新產生內容。

```sh aigne doc clear --targets generatedDocs icon=lucide:file-minus
aigne doc clear --targets generatedDocs
```

#### 清除結構與組態

此指令會執行更徹底的清理，移除所有已產生的文件、結構計畫以及主要組態檔。

```sh aigne doc clear --targets documentStructure documentConfig icon=lucide:files
aigne doc clear --targets documentStructure documentConfig
```

## 總結

`clear` 指令提供了一種直接的方法來管理您專案中產生的資產和組態。使用互動式模式可獲得安全、引導式的流程，或直接指定目標以用於自動化工作流程。由於這些操作會永久刪除檔案，建議在繼續之前備份任何重要資料。