# 清理

本指南說明如何使用 `aigne doc clear` 命令來移除專案中產生的檔案、設定和快取資料。此命令對於重新開始或移除敏感資訊很有用。

`clear` 命令可以以兩種模式執行：互動式和非互動式。若執行時不帶任何引數，將會啟動一個互動式精靈，引導您完成可用的清理選項。

```d2
direction: down

User: {
  shape: c4-person
}

Command-Execution: {
  label: "命令執行"
  shape: rectangle

  CLI: {
    label: "`aigne doc clear [targets]`"
  }

  Decision: {
    label: "是否提供\n引數？"
    shape: diamond
  }

  Interactive-Wizard: {
    label: "互動式精靈\n（目標清單）"
  }
}

Cleanup-Targets: {
  label: "清理目標"
  shape: rectangle
  grid-columns: 3

  generatedDocs: {}
  documentStructure: {}
  documentConfig: {}
  authTokens: {}
  deploymentConfig: {}
  mediaDescription: {}
}

Project-Artifacts: {
  label: "專案產物"
  shape: rectangle
  grid-columns: 3

  docs: {
    label: "./docs"
  }
  structure-plan: {
    label: "structure-plan.json"
  }
  config-yaml: {
    label: "config.yaml"
  }
  auth-config: {
    label: "~/.aigne/doc-smith-connected.yaml"
  }
  media-cache: {
    label: "媒體描述\n快取"
  }
}

User -> Command-Execution.CLI

Command-Execution.CLI -> Command-Execution.Decision

Command-Execution.Decision -> Command-Execution.Interactive-Wizard: "否"
Command-Execution.Decision -> Cleanup-Targets: "是"

Command-Execution.Interactive-Wizard -> Cleanup-Targets: "使用者選擇"

Cleanup-Targets.generatedDocs -> Project-Artifacts.docs: "刪除"
Cleanup-Targets.documentStructure -> Project-Artifacts.docs: "刪除"
Cleanup-Targets.documentStructure -> Project-Artifacts.structure-plan: "刪除"
Cleanup-Targets.documentConfig -> Project-Artifacts.config-yaml: "刪除"
Cleanup-Targets.authTokens -> Project-Artifacts.auth-config: "刪除"
Cleanup-Targets.deploymentConfig -> Project-Artifacts.config-yaml: "移除 appUrl"
Cleanup-Targets.mediaDescription -> Project-Artifacts.media-cache: "刪除"
```

## 命令用法

若要使用清理命令，請在您的終端機中執行以下指令：

```bash
aigne doc clear
```

或者，您可以直接指定一個或多個目標作為引數，以非互動方式執行此命令。

```bash
aigne doc clear --targets <target1> <target2> ...
```

## 清理選項

當您執行不帶引數的 `aigne doc clear` 命令時，系統會顯示一個互動式清單，讓您勾選要移除的項目。您可以一次選擇多個項目進行清理。

可用的清理目標詳述如下。

| Target | 說明 |
| :--- | :--- |
| **`generatedDocs`** | 從輸出目錄（例如 `./docs`）中刪除所有產生的文件檔案。此操作會保留文件結構檔案。 |
| **`documentStructure`** | 刪除所有產生的文件以及文件結構檔案（例如 `.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 刪除主專案設定檔（例如 `.aigne/doc-smith/config.yaml`）。您必須執行 `aigne doc init` 才能重新產生它。 |
| **`authTokens`** | 從檔案中刪除已儲存的授權權杖（例如 `~/.aigne/doc-smith-connected.yaml`）。系統會提示您選擇要清除哪些網站的授權。 |
| **`deploymentConfig`** | 從文件設定檔中移除 `appUrl`，但保留其他設定。 |
| **`mediaDescription`** | 刪除媒體檔案的快取 AI 生成描述（例如從 `.aigne/doc-smith/media-description.yaml`）。這些描述將在下次執行時重新產生。 |

## 範例

### 互動式清理

若要開始互動式清理流程，請執行不帶任何引數的命令。這將會顯示一個清單，您可以使用空格鍵選擇要移除的項目，並按 Enter 鍵確認。

```bash
aigne doc clear
```

### 非互動式清理

若要直接清除特定項目，請提供其目標名稱作為引數。

#### 僅清除產生的文件

此命令會移除 `docs` 目錄，但保留 `structure-plan.json` 檔案。

```bash
aigne doc clear --targets generatedDocs
```

#### 清除結構與設定

此命令會移除產生的文件、結構計畫以及設定檔。

```bash
aigne doc clear --targets documentStructure documentConfig
```

## 總結

`clear` 命令是一個管理專案狀態的工具。使用互動模式可獲得引導式流程，或直接指定目標以加快執行速度。由於這些操作是不可逆的，請確保在執行清理前已備份所有重要資料。