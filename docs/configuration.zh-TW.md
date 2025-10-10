# 設定

正確的設定對於根據專案的特定需求客製化文件產生過程至關重要。AIGNE DocSmith 使用一個主要設定檔和一個命令列介面來管理您的設定。這種設定方式確保產生的文件能準確反映您的專案目標、目標受眾和結構需求。

本節概述了如何設定此工具。有關逐步說明，請參閱以下詳細指南：

<x-cards>
  <x-card data-title="初始設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">了解如何執行互動式設定來建立您的 config.yaml 檔案。這是任何新專案的建議第一步。</x-card>
  <x-card data-title="管理偏好設定" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">了解如何檢視、啟用、停用或刪除已儲存的偏好設定，以隨著時間的推移來完善文件產生過程。</x-card>
</x-cards>

## `config.yaml` 檔案

所有專案層級的設定都儲存在名為 `config.yaml` 的檔案中，該檔案位於您專案內的 `.aigne/doc-smith/` 目錄中。`aigne doc init` 指令會透過一個互動式過程為您建立此檔案。您也可以隨時使用文字編輯器手動修改此檔案以調整設定。

以下是一個 `config.yaml` 檔案的範例，其中包含解釋每個區塊的註解。

```yaml Example config.yaml icon=logos:yaml
# 用於文件發布的專案資訊
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# 文件設定
# =============================================================================

# 目的：您希望讀者達成的最主要成果是什麼？
# 可用選項（取消註解並根據需要修改）：
#   getStarted       - 快速入門：幫助新使用者在 30 分鐘內從零到上手
#   completeTasks    - 完成特定任務：引導使用者完成常見的工作流程和使用案例
#   findAnswers      - 快速尋找答案：為所有功能和 API 提供可搜尋的參考資料
#   understandSystem - 了解系統：解釋其運作方式及設計決策的原因
#   solveProblems    - 解決問題：幫助使用者進行故障排除並修復問題
#   mixedPurpose     - 綜合目的：涵蓋多種需求的綜合性文件
documentPurpose:
  - getStarted
  - completeTasks

# 目標受眾：誰會最常閱讀這份文件？
# 可用選項（取消註解並根據需要修改）：
#   endUsers         - 終端使用者（非技術人員）：使用產品但不寫程式的人
#   developers       - 整合開發者：將此產品加入其專案的工程師
#   devops           - DevOps/基礎設施：部署、監控、維護系統的團隊
#   decisionMakers   - 技術決策者：評估或規劃實施的架構師、領導者
#   supportTeams     - 支援團隊：幫助他人使用產品的人員
#   mixedTechnical   - 混合技術受眾：開發者、DevOps 和技術使用者
targetAudienceTypes:
  - endUsers

# 讀者知識水平：讀者在閱讀文件時通常具備哪些知識？
# 可用選項（取消註解並根據需要修改）：
#   completeBeginners    - 完全初學者：對此領域/技術完全陌生
#   domainFamiliar       - 熟悉領域，工具新手：了解問題領域，但對此特定解決方案不熟
#   experiencedUsers     - 有經驗的使用者：需要參考資料/進階主題的常規使用者
#   emergencyTroubleshooting - 緊急/故障排除：出現問題，需要快速修復
#   exploringEvaluating  - 探索/評估：試圖了解這是否符合他們的需求
readerKnowledgeLevel: completeBeginners

# 文件深度：文件應該要多詳盡？
# 可用選項（取消註解並根據需要修改）：
#   essentialOnly      - 僅涵蓋必要內容：涵蓋 80% 的使用案例，保持簡潔
#   balancedCoverage   - 平衡的涵蓋範圍：具有足夠深度和實用範例 [建議]
#   comprehensive      - 全面詳盡：涵蓋所有功能、邊界案例和進階情境
#   aiDecide           - 讓 AI 決定：分析程式碼複雜度並建議適當的深度
documentationDepth: comprehensive

# 自訂規則：定義特定的文件產生規則與要求
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# 目標受眾：描述您的特定目標受眾及其特徵
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: ./docs  # 儲存產生文件的目錄
sourcesPath:  # 要分析的原始碼路徑
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./media.md
  - ./.aigne/doc-smith/config.yaml
```

## 總結

完成設定後，此工具將清楚了解您的專案、受眾和文件目標，從而產生更準確、更相關的內容。

若要開始設定您的專案，請前往 [初始設定](./configuration-initial-setup.md) 指南。