# 更新與完善

讓文件與不斷演進的程式碼庫保持同步是一個有條理的過程。AIGNE DocSmith 提供了直接而靈活的指令，可透過基於程式碼變更的自動更新，或透過精確、由回饋驅動的完善來讓您的內容保持最新。

本指南涵蓋以下程序：

- 在原始碼被修改時自動更新文件。
- 使用針對性的回饋重新生成特定文件。
- 調整整體文件結構。

### 文件更新工作流程

下圖說明了可用於更新文件的不同工作流程：

```d2 文件更新工作流程
direction: down

developer: {
  shape: c4-person
  label: "開發人員"
}

codebase: {
  shape: cylinder
  label: "原始碼"
}

updated-documentation: {
  shape: cylinder
  label: "已更新的\n文件"
}

workflows: {
  label: "文件更新工作流程"
  shape: rectangle

  automatic-updates: {
    label: "自動更新（程式碼驅動）"
    shape: rectangle

    cmd-generate: {
      label: "aigne doc generate"
    }

    decision-force: {
      label: "--forceRegenerate？"
      shape: diamond
    }

    detect-changes: {
      label: "偵測變更"
    }

    regen-affected: {
      label: "重新生成\n受影響文件"
    }

    regen-all: {
      label: "重新生成\n所有文件"
    }
  }

  manual-refinements: {
    label: "手動完善（回饋驅動）"
    shape: rectangle
    grid-columns: 2
    grid-gap: 100

    refine-individual: {
      label: "完善個別文件"
      shape: rectangle

      cmd-update: {
        label: "aigne doc update\n--feedback"
      }

      regen-specific: {
        label: "重新生成\n特定文件"
      }
    }

    optimize-structure: {
      label: "優化整體結構"
      shape: rectangle

      cmd-generate-feedback: {
        label: "aigne doc generate\n--feedback"
      }

      re-evaluate-plan: {
        label: "重新評估\n文件計畫"
      }
    }
  }
}

# --- Connections ---

# Path 1: Automatic Updates
developer -> codebase: "1. 進行變更"
codebase -> workflows.automatic-updates.cmd-generate: "2. 執行指令"
workflows.automatic-updates.cmd-generate -> workflows.automatic-updates.decision-force
workflows.automatic-updates.decision-force -> workflows.automatic-updates.detect-changes: "否"
workflows.automatic-updates.detect-changes -> workflows.automatic-updates.regen-affected
workflows.automatic-updates.decision-force -> workflows.automatic-updates.regen-all: "是"
workflows.automatic-updates.regen-affected -> updated-documentation
workflows.automatic-updates.regen-all -> updated-documentation

# Path 2: Individual Refinement
developer -> workflows.manual-refinements.refine-individual.cmd-update: "3. 提供\n內容回饋"
workflows.manual-refinements.refine-individual.cmd-update -> workflows.manual-refinements.refine-individual.regen-specific
workflows.manual-refinements.refine-individual.regen-specific -> updated-documentation

# Path 3: Structural Refinement
developer -> workflows.manual-refinements.optimize-structure.cmd-generate-feedback: "4. 提供\n結構性回饋"
workflows.manual-refinements.optimize-structure.cmd-generate-feedback -> workflows.manual-refinements.optimize-structure.re-evaluate-plan
workflows.manual-refinements.optimize-structure.re-evaluate-plan -> updated-documentation: "以\n新結構重新生成"
```

---

## 具備變更偵測的自動更新

當您執行 `aigne doc generate` 指令時，DocSmith 會先分析您的程式碼庫以偵測自上次生成以來的變更。接著，它只會重新生成受這些變更影響的文件。這種預設行為可以節省時間並減少 API 的使用。

```shell icon=lucide:terminal
# DocSmith 將偵測變更並僅更新必要部分
aigne doc generate
```

![DocSmith 偵測變更並僅重新生成所需文件。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 強制完整重新生成

若要從頭開始重新生成所有文件，繞過快取和變更偵測，請使用 `--forceRegenerate` 旗標。當您進行了重大的設定變更或需要完全重建以確保一致性時，這項操作是必要的。

```shell icon=lucide:terminal
# 從頭開始重新生成所有文件
aigne doc generate --forceRegenerate
```

---

## 完善個別文件

若要在沒有相應程式碼變更的情況下改善特定文件的內容，請使用 `aigne doc update` 指令。此指令允許您提供針對性的指示以進行完善。

這可以透過互動模式或透過命令列參數以非互動方式完成。

### 互動模式

若要進行引導式流程，請在不帶任何參數的情況下執行該指令。DocSmith 將會顯示一個選單，讓您選擇想要更新的文件。選擇後，系統將提示您輸入回饋。

```shell icon=lucide:terminal
# 啟動互動式更新流程
aigne doc update
```

![以互動方式選擇您希望更新的文件。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接透過命令列更新

對於腳本化或更快速的工作流程，您可以使用旗標直接指定文件和回饋。這可以實現精確的非互動式更新。

```shell icon=lucide:terminal
# 透過回饋更新特定文件
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

以下是 `update` 指令的關鍵參數：

| 參數 | 說明 |
| --- | --- |
| `--docs` | 要更新的文件的路徑。此旗標可多次使用以進行批次更新。 |
| `--feedback` | 重新生成內容時要使用的具體指示。 |

---

## 優化整體結構

除了完善個別文件內容外，您還可以調整整體的文件結構。如果現有組織不理想或缺少某個部分，您可以向 `generate` 指令提供回饋。

這會指示 DocSmith 根據您的輸入重新評估整個文件計畫。

```shell icon=lucide:terminal
# 根據特定回饋重新生成文件結構
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

此方法適用於對文件目錄進行高層次的變更，而非用於微小的內容編輯。

一旦您的內容完善後，下一步就是為全球受眾準備。有關說明，請參閱 [翻譯文件](./features-translate-documentation.md) 指南。