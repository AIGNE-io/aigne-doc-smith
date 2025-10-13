# 設定

適當的設定是根據您專案的特定需求，量身打造文件生成流程的基礎。AIGNE DocSmith 使用一個主要設定檔來進行全專案的設定，並透過一個獨立的指令來管理個人偏好設定。這種方法確保產生的文件能精確符合您的專案目標、目標受眾和結構需求。

本節提供了設定流程的高階概覽。若需詳細的逐步說明，請參考以下指南：

<x-cards>
  <x-card data-title="初始設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">了解如何執行互動式設定來建立您的 config.yaml 檔案。這是任何新專案建議的第一步。</x-card>
  <x-card data-title="管理偏好設定" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">了解如何檢視、啟用、停用或刪除已儲存的偏好設定，以隨著時間推移不斷完善文件生成流程。</x-card>
</x-cards>

## `config.yaml` 檔案

所有專案層級的設定都儲存在您專案 `.aigne/doc-smith/` 目錄中一個名為 `config.yaml` 的檔案裡。`aigne doc init` 指令會透過互動式引導流程為您建立此檔案。您也可以隨時使用文字編輯器手動修改此檔案以調整設定。

以下是一個 `config.yaml` 檔案的範例，其中包含解釋每個設定選項的註解。

```yaml config.yaml icon=logos:yaml
# 用於文件發佈的專案資訊
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith 是一款強大的、由 AI 驅動的文件生成工具，建立在 AIGNE Framework 之上。它可以直接從您的原始碼自動建立詳細、結構化且多語言的文件。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# 文件設定
# =============================================================================

# 目的：您希望讀者達成的最主要成果是什麼？
# 可用選項：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - getStarted
  - completeTasks

# 目標受眾：誰最常閱讀這份文件？
# 可用選項：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - endUsers

# 讀者知識水平：讀者通常在閱讀前具備哪些知識？
# 可用選項：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: completeBeginners

# 文件深度：文件應該要多詳盡？
# 可用選項：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: comprehensive

# 自訂規則：定義具體的文件生成規則和要求
rules: |
  避免使用模糊或空泛的詞語，這些詞語無法提供可衡量或具體的細節，例如「智慧地」、「無縫地」、「全面地」或「高品質」。請專注於具體、可驗證的事實和資訊。
  請專注於具體、可驗證的事實和資訊。
  必須涵蓋 DocSmith 的所有子指令

# 目標受眾：詳細描述您的特定目標受眾及其特徵
targetAudience: |
  
# 詞彙表：定義專案特定的術語和定義
# glossary: "@glossary.md"  # 包含詞彙表定義的 Markdown 檔案路徑

# 文件的主要語言
locale: en

# 用於翻譯的其他語言列表
translateLanguages:
  - zh
  - zh-TW
  - ja

# 儲存生成文件的目錄
docsDir: ./docs

# 用於分析以生成文件的原始碼路徑
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml

# =============================================================================
# 媒體設定
# =============================================================================

# 圖片品質篩選：只有寬度大於此值的圖片會被包含
# 這有助於過濾低解析度圖片以維持文件品質
# 建議值：一般文件為 800px，高品質文件為 1200px
media:
  minImageWidth: 800
```

## 管理使用者偏好設定

除了全專案通用的 `config.yaml`，您還可以管理個人偏好設定，以根據您的特定需求微調 AI 的行為。這些偏好設定儲存在本機，可以啟用、停用或移除，而不會更改專案的設定檔。

偏好設定是使用 `aigne doc prefs` 指令來管理，該指令支援以下操作：
*   `--list`：檢視所有已儲存的偏好設定及其狀態（啟用／停用）。
*   `--remove`：刪除一個或多個已儲存的偏好設定。
*   `--toggle`：啟用或停用特定的偏好設定。

有關使用這些指令的完整指南，請參閱[管理偏好設定](./configuration-managing-preferences.md)。

## 總結

透過正確設定 `config.yaml` 並管理您的個人偏好設定，您為工具提供了關於專案、受眾和文件目標的明確指令。這將產生更準確且相關的生成內容。

若要開始設定您的專案，請前往[初始設定](./configuration-initial-setup.md)指南。