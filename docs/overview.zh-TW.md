# 總覽

AIGNE DocSmith 是一款由 AI 驅動的工具，可直接從您的原始程式碼生成文件。它建立在 [AIGNE Framework](https://www.aigne.io/en/framework) 之上，可自動創建結構化、多語言的文件。此過程減少了撰寫和維護文件的人工工作，確保文件與程式碼庫保持同步。

下圖說明了 DocSmith 的高階工作流程：

```d2
direction: right
style: {
  font-size: 14
}

# Actors
source_code: "原始程式碼儲存庫" {
  shape: cloud
  style: {
    fill: "#F0F4F8"
    stroke: "#4A5568"
  }
}

docsmith: "AIGNE DocSmith 引擎" {
  shape: hexagon
  style: {
    fill: "#E6FFFA"
    stroke: "#2C7A7B"
  }
}

published_docs: "已發佈文件" {
  shape: document
  style: {
    fill: "#FEFCBF"
    stroke: "#B7791F"
  }
}

# Main Flow
source_code -> docsmith: "1. 分析程式碼"
docsmith -> published_docs: "2. 生成與發佈"

# DocSmith Internal Process
subflow: {
  direction: down
  
  analyze: "分析與規劃結構"
  generate: "生成內容"
  translate: "翻譯 (可選)"
  publish: "發佈"
  
  analyze -> generate -> translate -> publish
}

docsmith.subflow: subflow
```

## 核心功能

DocSmith 提供了一系列功能來自動化和簡化文件編寫過程：

*   **結構規劃：** 分析程式碼庫以生成合乎邏輯的文件結構。
*   **內容生成：** 用從原始程式碼生成的內容填充已規劃的文件結構。
*   **多語言支援：** 將文件翻譯成 12 種語言，包括英文、中文、日文和西班牙文。
*   **AIGNE Hub 整合：** 使用 [AIGNE Hub](https://www.aigne.io/en/hub) 作為 LLM 供應商，無需管理個別 API 金鑰即可切換模型。
*   **一鍵發佈：** 讓您的文件上線並附帶可分享的連結。可發佈至官方平台 [docsmith.aigne.io](https://docsmith.aigne.io/app/) 或您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 實例。
*   **迭代更新：** 偵測原始程式碼變更以更新文件，並支援根據使用者回饋針對特定文件進行重新生成。

## AIGNE 生態系的一部分

DocSmith 是 [AIGNE](https://www.aigne.io) 生態系的一個關鍵組件，該生態系是開發 AI 應用的平台。它與其他 AIGNE 組件整合，以利用平台的 AI 功能和基礎設施。

下圖說明了 DocSmith 如何融入 AIGNE 架構：

![AIGNE 生態系架構](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 後續步驟

要開始使用 DocSmith，請繼續閱讀安裝與設定指南。

<x-card data-title="下一步：開始使用" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="開始指南">
依照逐步指南安裝工具、設定您的第一個專案並生成文件。
</x-card>