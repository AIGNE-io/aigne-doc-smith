# 概要

AIGNE DocSmith は、ソースコードから直接ドキュメントを生成する AI 駆動のツールです。[AIGNE Framework](https://www.aigne.io/en/framework) 上に構築されており、構造化された多言語ドキュメントの作成を自動化します。このプロセスにより、ドキュメントの作成と保守にかかる手作業が削減され、コードベースとの同期が確保されます。

以下の図は、DocSmith の高レベルなワークフローを示しています。

```d2
direction: right
style: {
  font-size: 14
}

# Actors
source_code: "ソースコードリポジトリ" {
  shape: cloud
  style: {
    fill: "#F0F4F8"
    stroke: "#4A5568"
  }
}

docsmith: "AIGNE DocSmith エンジン" {
  shape: hexagon
  style: {
    fill: "#E6FFFA"
    stroke: "#2C7A7B"
  }
}

published_docs: "公開されたドキュメント" {
  shape: document
  style: {
    fill: "#FEFCBF"
    stroke: "#B7791F"
  }
}

# Main Flow
source_code -> docsmith: "1. コードの分析"
docsmith -> published_docs: "2. 生成と公開"

# DocSmith Internal Process
subflow: {
  direction: down
  
  analyze: "分析と構造計画"
  generate: "コンテンツの生成"
  translate: "翻訳（オプション）"
  publish: "公開"
  
  analyze -> generate -> translate -> publish
}

docsmith.subflow: subflow
```

## 主な機能

DocSmith は、ドキュメント作成プロセスを自動化し、簡素化するための一連の機能を提供します。

*   **構造計画:** コードベースを分析して、論理的なドキュメント構造を生成します。
*   **コンテンツ生成:** 計画されたドキュメント構造に、ソースコードから生成されたコンテンツを投入します。
*   **多言語サポート:** ドキュメントを英語、中国語、日本語、スペイン語など12言語に翻訳します。
*   **AIGNE Hub との統合:** [AIGNE Hub](https://www.aigne.io/en/hub) を LLM プロバイダーとして使用し、個別の API キーを管理することなくモデルを切り替えることができます。
*   **ワンクリック公開:** ドキュメントを共有可能なリンクで公開します。公式プラットフォーム [docsmith.aigne.io](https://docsmith.aigne.io/app/) または独自の [Discuss Kit](https://www.web3kit.rocks/discuss-kit) インスタンスに公開できます。
*   **反復的な更新:** ソースコードの変更を検出してドキュメントを更新し、ユーザーのフィードバックに基づいて特定のドキュメントの再生成をサポートします。

## AIGNE エコシステムの一部

DocSmith は、AI アプリケーションを開発するためのプラットフォームである [AIGNE](https://www.aigne.io) エコシステムの主要なコンポーネントです。他の AIGNE コンポーネントと統合して、プラットフォームの AI 機能とインフラストラクチャを利用します。

以下の図は、DocSmith が AIGNE アーキテクチャ内でどのように位置づけられるかを示しています。

![AIGNE エコシステムのアーキテクチャ](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 次のステップ

DocSmith の使用を開始するには、インストールと設定のガイドに進んでください。

<x-card data-title="次へ：はじめに" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="ガイドを開始">
ステップバイステップのガイドに従って、ツールをインストールし、最初のプロジェクトを設定して、ドキュメントを生成します。
</x-card>