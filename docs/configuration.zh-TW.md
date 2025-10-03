# 設定指南

AIGNE DocSmith 的行為由一個中央設定檔 `.aigne/doc-smith/config.yaml` 控制。此檔案可讓您自訂文件的風格、目標受眾、語言和結構，以滿足您的特定需求。

您可以透過執行 `aigne doc init`，使用互動式設定精靈來建立和管理此檔案。如需逐步教學，請參閱 [互動式設定](./configuration-interactive-setup.md) 指南。或者，您也可以直接編輯檔案以進行更精細的控制。

下圖說明了設定工作流程：

```d2 設定工作流程
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "執行指令\n'aigne doc init'"
  shape: rectangle
}

Setup-Wizard: {
  label: "互動式設定精靈"
  shape: rectangle
}

Config-File: {
  label: ".aigne/doc-smith/config.yaml"
  shape: rectangle
}

AIGNE-DocSmith-Engine: {
  label: "AIGNE DocSmith 引擎"
}

# 路徑 1：互動式設定 (建議)
User -> CLI: "建議路徑"
CLI -> Setup-Wizard: "啟動"
Setup-Wizard -> Config-File: "建立 / 修改"

# 路徑 2：手動編輯
User -> Config-File: "替代路徑：\n直接編輯"

# 最後步驟
Config-File -> AIGNE-DocSmith-Engine: "設定"
```

## 核心設定區域

您的文件由幾個關鍵的設定區域構成。探索這些指南以了解如何微調產生過程的每個方面。

<x-cards data-columns="2">
  <x-card data-title="互動式設定" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    了解引導式精靈如何幫助您設定文件專案，包括設定建議和衝突偵測。
  </x-card>
  <x-card data-title="LLM 設定" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    探索如何連接不同的 AI 模型，包括使用無需 API 金鑰的內建 AIGNE Hub。
  </x-card>
  <x-card data-title="語言支援" data-icon="lucide:languages" data-href="/configuration/language-support">
    查看支援的語言完整列表，並了解如何設定主要語言和啟用自動翻譯。
  </x-card>
  <x-card data-title="管理偏好設定" data-icon="lucide:sliders-horizontal" data-href="/configuration/preferences">
    了解 DocSmith 如何使用您的回饋來建立持續性規則，以及如何透過 CLI 管理它們。
  </x-card>
</x-cards>

## 參數參考

`config.yaml` 檔案包含數個控制文件輸出的鍵值對。以下是每個參數的詳細參考。

### 專案資訊

這些設定提供有關您專案的基本背景資訊，用於發布文件。

| 參數 | 說明 |
|---|---|
| `projectName` | 您的專案名稱。如果 `package.json` 存在，則會從中偵測。 |
| `projectDesc` | 您專案的簡短描述。從 `package.json` 偵測。 |
| `projectLogo` | 您專案標誌圖片的路徑或 URL。 |

### 文件策略

這些參數定義了產生內容的語氣、風格和深度。

#### `documentPurpose`
定義您希望讀者達成的​​主要成果。此設定會影響文件的整體結構和重點。

| 選項 | 名稱 | 說明 |
|---|---|---|
| `getStarted` | 快速入門 | 幫助新使用者在 30 分鐘內從零開始上手。 |
| `completeTasks` | 完成特定任務 | 引導使用者完成常見的工作流程和使用案例。 |
| `findAnswers` | 快速尋找答案 | 為所有功能和 API 提供可搜尋的參考資料。 |
| `understandSystem`| 了解系統 | 解釋其運作原理以及做出設計決策的原因。 |
| `solveProblems` | 解決常見問題 | 幫助使用者排解和修復問題。 |
| `mixedPurpose` | 滿足多種目的 | 涵蓋多種需求的文件。 |

#### `targetAudienceTypes`
定義最常閱讀此文件的對象。此選擇會影響寫作風格和範例。

| 選項 | 名稱 | 說明 |
|---|---|---|
| `endUsers` | 終端使用者（非技術人員） | 使用產品但不寫程式的人。 |
| `developers` | 整合您產品/API 的開發人員 | 將此功能加入其專案的工程師。 |
| `devops` | DevOps / SRE / 基礎架構團隊 | 部署、監控和維護系統的團隊。 |
| `decisionMakers`| 技術決策者 | 評估或規劃實施的架構師或主管。 |
| `supportTeams` | 支援團隊 | 幫助他人使用產品的人員。 |
| `mixedTechnical`| 混合技術受眾 | 開發人員、DevOps 和其他技術使用者。 |

#### `readerKnowledgeLevel`
定義讀者通常具備的知識。這會調整文件中假設的基礎知識量。

| 選項 | 名稱 | 說明 |
|---|---|---|
| `completeBeginners` | 完全的初學者，從零開始 | 對此領域/技術完全陌生。 |
| `domainFamiliar` | 曾使用過類似工具 | 了解問題領域，但對此特定解決方案不熟悉。 |
| `experiencedUsers` | 試圖完成特定任務的專家 | 需要參考資料或進階主題的常規使用者。 |
| `emergencyTroubleshooting`| 緊急/故障排除 | 某個東西壞了，需要快速修復。 |
| `exploringEvaluating` | 正在評估此工具與其他工具的比較 | 試圖了解此工具是否符合他們的需求。 |

#### `documentationDepth`
定義文件的全面性程度。

| 選項 | 名稱 | 說明 |
|---|---|---|
| `essentialOnly` | 僅限必要內容 | 涵蓋 80% 的使用案例，保持簡潔。 |
| `balancedCoverage`| 平衡的涵蓋範圍 | 具備良好深度和實用範例 [建議]。 |
| `comprehensive` | 全面性 | 涵蓋所有功能、邊緣案例和進階情境。 |
| `aiDecide` | 讓 AI 決定 | 分析程式碼複雜度並建議適當的深度。 |

### 自訂指令

若要進行更精細的控制，您可以提供自由文字的指令。

| 參數 | 說明 |
|---|---|
| `rules` | 一個多行字串，您可以在其中定義特定的文件產生規則（例如：「務必包含效能基準測試」）。 |
| `targetAudience`| 一個多行字串，用以比預設選項更詳細地描述您的特定目標受眾。 |

### 語言與路徑設定

這些設定控制在地化和檔案位置。

| 參數 | 說明 |
|---|---|
| `locale` | 文件的主要語言（例如：`en`、`zh`）。 |
| `translateLanguages` | 要將文件翻譯成的語言代碼列表（例如：`[ja, fr, es]`）。 |
| `docsDir` | 儲存產生的文件檔案的目錄。 |
| `sourcesPath` | 供 DocSmith 分析的原始碼路徑或 glob 模式列表（例如：`['./src', './lib/**/*.js']`）。 |
| `glossary` | 指向一個 markdown 檔案（`@glossary.md`）的路徑，該檔案包含專案特定術語，以確保翻譯的一致性。 |

## config.yaml 範例

這是一個完整的設定檔範例。您可以隨時直接編輯此檔案以變更設定。

```yaml config.yaml 範例 icon=logos:yaml
# 文件發布的專案資訊
projectName: AIGNE DocSmith
projectDesc: An AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# 文件設定
# =============================================================================

# 目的：您希望讀者達成的​​主要成果是什麼？
# 選項：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - completeTasks
  - findAnswers

# 目標受眾：誰最常閱讀此文件？
# 選項：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - developers

# 讀者知識水平：讀者通常具備什麼知識？
# 選項：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: domainFamiliar

# 文件深度：文件應有多全面？
# 選項：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: balancedCoverage

# 自訂規則：定義特定的文件產生規則和要求
rules: |+
  

# 目標受眾：描述您的特定目標受眾及其特徵
targetAudience: |+
  

# 詞彙表：包含專案特定術語和定義的 markdown 檔案路徑
# glossary: "@glossary.md"

# 文件的主要語言
locale: en

# 要將文件翻譯成的語言列表
# translateLanguages:
#   - zh
#   - fr

# 儲存產生的文件的目錄
docsDir: .aigne/doc-smith/docs

# 要分析的原始碼路徑
sourcesPath:
  - ./
```

設定完成後，您就可以建立符合專案需求的文件了。下一步是執行產生指令。

➡️ **下一步：** [產生文件](./features-generate-documentation.md)