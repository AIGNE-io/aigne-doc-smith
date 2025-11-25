# 設定參考

`config.yaml` 檔案是您文件產生的核心控制面板。透過調整其設定，您可以控制 AI 如何產生文件，包括文件結構、內容風格和語言支援。本指南為每個設定欄位提供了詳細的解釋，以幫助您根據專案需求進行微調。

## 總覽

`config.yaml` 檔案是 AIGNE DocSmith 的主要設定檔。它以 YAML 格式儲存所有設定參數。當您執行 `create`、`update` 或 `translate` 等指令時，DocSmith 會讀取此檔案以了解您的設定需求。

- **檔案名稱：**`config.yaml`
- **位置：**`.aigne/doc-smith/config.yaml`（相對於您的專案根目錄）
- **格式：**YAML (UTF-8)

透過此檔案，您可以設定文件目標、目標讀者、內容產生規則、文件結構、多語言支援和發佈設定。

### 建立與更新設定

首次使用 DocSmith 時，會自動建立 `config.yaml` 檔案。

**建立：**

您可以透過兩種方式建立此檔案：

1.  **在初次產生時：** 在新專案中執行 `aigne doc create` 將會啟動一個互動式精靈，在開始產生過程之前建立 `config.yaml` 檔案。
2.  **單獨建立：** 執行 `aigne doc init` 將會啟動同一個精靈來建立設定檔，而不會立即產生文件。

```sh aigne doc init icon=lucide:terminal
aigne doc init
```

**更新：**

您可以使用以下其中一種方法來更新您的設定：

1.  **直接編輯檔案：** 在文字編輯器中開啟 `.aigne/doc-smith/config.yaml` 並修改欄位。
2.  **使用互動式精靈：** 再次執行 `aigne doc init`。精靈將會載入您現有的設定並引導您進行更新。

## 設定參數

`config.yaml` 中的欄位按功能群組進行組織。以下各節將詳細解釋每個參數。

### 專案基礎資訊

這些欄位定義了用於文件品牌、搜尋引擎最佳化和社群媒體分享的基本專案資訊。

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>您專案的顯示名稱，會出現在文件標題、導覽列和其他品牌元素中。建議長度保持在 50 個字元以內，以確保在各種介面中能完整顯示。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>您專案的簡要描述，用於搜尋引擎最佳化和社群分享預覽文字。建議長度保持在 150 個字元以內，清晰簡潔地描述您專案的核心價值。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>您專案標誌的 URL 或本地檔案路徑。該標誌將顯示在文件網站的頁首、瀏覽器分頁圖示和社群媒體分享預覽中。支援完整 URL（例如 `https://example.com/logo.png`）或相對路徑（例如 `./assets/logo.png`）。</x-field-desc>
  </x-field>
</x-field-group>

### AI 思維設定

這些設定控制 AI 在產生文件內容時的思維深度和處理強度，影響產生品質和速度之間的平衡。

<x-field-group>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>設定 AI 推理強度。</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>控制 AI 思維強度。選項：`lite`（快速模式，適用於簡單文件）、`standard`（標準模式，建議用於大多數情境）、`pro`（深度模式，適用於複雜文件但產生時間較長）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 文件策略

這些設定定義了文件產生策略，包括文件目標、讀者類型、內容深度等，直接影響 AI 如何組織和產生內容。

<x-field-group>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>定義文件的主要目標（可複選）。選項包括：`getStarted`（快速入門指南）、`completeTasks`（任務操作手冊）、`findAnswers`（參考查詢手冊）、`understandSystem`（系統理解文件）、`solveProblems`（故障排除指南）和 `mixedPurpose`（綜合性文件）。選擇不同的目標會影響文件結構和內容組織。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>指定目標讀者類型（可複選）。選項包括：`endUsers`（一般使用者）、`developers`（開發者）、`devops`（維運工程師）、`decisionMakers`（技術決策者）、`supportTeams`（技術支援團隊）和 `mixedTechnical`（混合技術背景）。選擇不同的讀者類型會影響文件語言風格、技術深度和範例類型。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>設定目標讀者的技術知識水平。選項包括：`completeBeginners`（完全新手，需要詳細解釋）、`domainFamiliar`（熟悉相關領域但首次使用此工具）、`experiencedUsers`（有經驗的使用者，需要參考手冊）、`emergencyTroubleshooting`（緊急故障排除，需要快速解決方案）和 `exploringEvaluating`（評估適用性，需要快速理解）。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>控制文件的詳細程度。選項包括：`essentialOnly`（僅核心功能，精簡版）、`balancedCoverage`（平衡涵蓋，建議用於大多數專案）、`comprehensive`（全面涵蓋，包括所有功能和邊際案例）和 `aiDecide`（由 AI 根據程式碼複雜度自動決定）。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudience" data-type="string" data-required="false">
    <x-field-desc markdown>對目標讀者的詳細描述，用於補充 `targetAudienceTypes` 設定。可以描述讀者的特定背景、使用情境、技術堆疊或特殊需求。支援多行文字，幫助 AI 更好地理解讀者需求。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>為 AI 提供詳細的產生規則和指引，包括內容結構、寫作風格、格式要求等。這是最重要的設定欄位之一，直接影響所產生文件的品質和風格。支援 Markdown 格式，允許使用多行規則。建議詳細說明您的具體要求，例如：「避免使用模糊的詞語」、「必須包含程式碼範例」等。</x-field-desc>
  </x-field>
</x-field-group>

### 語言

設定主要語言以及任何用於翻譯的附加語言。

<x-field-group>
  <x-field data-name="locale" data-type="string" data-default="en" data-required="false">
    <x-field-desc markdown>文件的主要語言，使用標準語言代碼。常見值包括：`en`（英文）、`zh`（簡體中文）、`zh-TW`（繁體中文）、`ja`（日文）等。文件將首先以此語言產生，然後可以翻譯成其他語言。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>用於翻譯的目標語言列表（可複選）。每個語言代碼都將產生一套完整的翻譯文件。例如，設定 `["zh", "ja"]` 將產生簡體中文和日文版本的文件。注意：請勿包含與 `locale` 相同的語言代碼。</x-field-desc>
  </x-field>
</x-field-group>

### 資料來源

這些設定指定 AI 在分析原始碼和文件時使用的參考資料，直接影響所產生文件的品質和準確性。

<x-field-group>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>供 AI 分析的原始碼和文件路徑列表。**這是最重要的設定欄位**，因為 AI 只會根據這些路徑中的內容來產生文件。建議包含：README 檔案、主要原始碼目錄、設定檔（如 `package.json`、`aigne.yaml`）、現有文件目錄等。支援多種格式：目錄路徑（例如 `./src`）、檔案路徑（例如 `./README.md`）、glob 模式（例如 `src/**/*.js`）和遠端 URL。</x-field-desc>
  </x-field>
</x-field-group>

### 輸出與部署

設定產生文件的儲存位置和發佈地址。

<x-field-group>
  <x-field data-name="docsDir" data-type="string" data-default="./aigne/doc-smith/docs" data-required="false">
    <x-field-desc markdown>儲存所產生文件的目錄。所有產生的 Markdown 檔案都將儲存在此目錄中。如果目錄不存在，DocSmith 會自動建立它。建議使用相對路徑以便於專案遷移。</x-field-desc>
  </x-field>
  <x-field data-name="appUrl" data-type="string" data-required="false">
    <x-field-desc markdown>文件發佈後的存取地址。執行 `publish` 指令後，DocSmith 會自動更新此欄位。通常不需要手動設定，除非您想指定一個特定的發佈地址。</x-field-desc>
  </x-field>
</x-field-group>

### 媒體與顯示

這些設定控制如何處理圖片等媒體資產。

<x-field-group>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>媒體檔案處理設定。</x-field-desc>
    <x-field data-name="minImageWidth" data-type="integer" data-default="800" data-required="false">
      <x-field-desc markdown>要包含在文件中的圖片最小寬度（以像素為單位）。只有寬度大於此值的圖片會被使用，有助於過濾掉低品質或過小的圖片。建議值：600-800 像素（平衡品質與數量）、800-1000 像素（高品質要求）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 圖表設定

控制圖表產生行為和 AI 的投入程度。

<x-field-group>
  <x-field data-name="diagramming" data-type="object" data-required="false">
    <x-field-desc markdown>圖表產生設定。</x-field-desc>
    <x-field data-name="effort" data-type="integer" data-default="5" data-required="false">
      <x-field-desc markdown>AI 產生圖表時的投入程度，範圍為 0-10。值越高，產生的圖表越少。建議設定：0-3（產生許多圖表，適用於需要豐富視覺解釋的文件）、4-6（平衡模式，建議使用）、7-10（產生少量圖表，更專注於文字內容）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 系統管理欄位

這些欄位由 DocSmith 自動管理，通常不需要手動編輯。修改這些欄位可能會導致意外問題。

<x-field-group>
  <x-field data-name="lastGitHead" data-type="string" data-required="false">
    <x-field-desc markdown>上次文件產生時的 Git commit 雜湊值。DocSmith 使用此值來判斷哪些檔案已變更，以實現增量更新。**請勿手動修改**。</x-field-desc>
  </x-field>
  <x-field data-name="boardId" data-type="string" data-required="false">
    <x-field-desc markdown>文件發佈板的唯一識別碼，由系統自動產生。**請勿手動修改**，否則會導致專案與其發佈歷史記錄中斷連線，並可能遺失已發佈的文件。</x-field-desc>
  </x-field>
  <x-field data-name="checkoutId" data-type="string" data-required="false">
    <x-field-desc markdown>文件部署期間使用的臨時識別碼，由系統自動管理。**請勿手動修改**。</x-field-desc>
  </x-field>
  <x-field data-name="shouldSyncBranding" data-type="string" data-required="false">
    <x-field-desc markdown>控制是否同步品牌資訊的臨時變數，由系統自動管理。**請勿手動修改**。</x-field-desc>
  </x-field>
</x-field-group>

## 套用變更

修改 `config.yaml` 檔案後，您需要執行相應的指令才能使變更生效。不同的欄位需要不同的指令，如下表所示。

| 欄位 | 套用變更的指令 | 說明 |
| :-------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------ |
| `documentPurpose`, `targetAudienceTypes`, `readerKnowledgeLevel`, `documentationDepth`, `locale` | `aigne doc clear && aigne doc create` | 這些欄位影響整體文件結構，需要清除舊文件並重新產生。 |
| `rules`, `targetAudience`, `media.minImageWidth`, `thinking.effort`, `diagramming.effort` | `aigne doc update` | 這些欄位僅影響內容產生方式，可以直接更新現有文件而無需重新產生。 |
| `sourcesPath` | `aigne doc clear && aigne doc create` 或 `aigne doc update` | 新增資料來源後，您可以選擇完全重新產生或增量更新。建議首次新增時使用 `create`，後續新增時使用 `update`。 |
| `translateLanguages` | `aigne doc translate` | 新增翻譯語言後，執行此指令以產生相應語言版本的文件。 |
| `projectName`, `projectDesc`, `projectLogo`, `appUrl` | `aigne doc publish` | 這些欄位主要用於發佈時的中繼資料。修改後，重新發佈即可生效。 |
| `docsDir` | `aigne doc create` | 修改輸出目錄後，下次文件產生將儲存到新目錄。 |

## 完整設定範例

以下是 AIGNE DocSmith 專案本身的完整 `config.yaml` 檔案，展示了一個真實世界中的設定。

```yaml config.yaml
# 文件發佈的專案資訊
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith 是一款基於 AIGNE Framework 建立的強大、由 AI 驅動的文件建立工具。它可以直接從您的原始碼中自動建立詳細、結構化且多語言的文件。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# 文件設定
# =============================================================================

# 目的：您希望讀者達成的最主要成果是什麼？
documentPurpose:
  - getStarted
  - completeTasks

# 目標受眾：誰會最常閱讀此文件？
targetAudienceTypes:
  - endUsers

# 讀者知識水平：讀者在閱讀文件時通常具備哪些知識？
readerKnowledgeLevel: completeBeginners

# 文件深度：文件應該多麼全面？
documentationDepth: comprehensive

# 自訂規則：定義特定的文件產生規則和要求
rules: |
  避免使用模糊或空泛的詞語，這些詞語無法提供可衡量或具體的細節，例如「智慧地」、「無縫地」、「全面地」或「高品質的」。專注於具體、可驗證的事實和資訊。
  專注於具體、可驗證的事實和資訊。
  必須涵蓋 DocSmith 的所有子指令

# 目標受眾：描述您的特定目標受眾及其特徵
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: .aigne/doc-smith/docs
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml
  - ./assets/screenshots
lastGitHead: d9d2584f23aee352485f369f60142949db601283
# ⚠️ 警告：boardId 由系統自動產生，請勿手動編輯
boardId: "docsmith"
appUrl: https://docsmith.aigne.io
# 用於文件部署服務的 Checkout ID
checkoutId: ""

diagramming:
  effort: 5 # AI 繪製圖表的投入程度，0-10，數字越大圖表越少
# AI 思維設定
# thinking.effort: 決定 AI 回應時使用的推理深度和認知投入程度，可用選項：
#   - lite: 快速回應，具備基本推理能力
#   - standard: 平衡的速度和推理能力
#   - pro: 深入的推理，但回應時間較長
thinking:
  effort: standard
# 是否應為文件同步品牌資訊
shouldSyncBranding: ""
```

## 總結

`config.yaml` 檔案是控制文件產生的核心。透過適當地設定專案資訊、文件策略和資料來源，您可以引導 AI 產生符合您專案需求的高品質文件。建議從基本設定開始，並根據實際結果逐步調整參數。

如需更多實用指引，請參考以下指南：

<x-cards data-columns="3">
  <x-card data-title="初始設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">學習從零開始建立您第一個文件專案的完整工作流程。</x-card>
  <x-card data-title="準備材料" data-icon="lucide:folder-check" data-href="/guides/prepare-materials">了解如何準備來源文件以獲得最佳效果。</x-card>
  <x-card data-title="疑難排解" data-icon="lucide:wrench" data-href="/guides/troubleshooting">尋找常見設定和產生問題的解決方案。</x-card>
</x-cards>