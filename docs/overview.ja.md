# 概要

AIGNE DocSmithは、ソースコードから直接ドキュメントを生成するAI駆動のツールです。[AIGNE Framework](https://www.aigne.io/en/framework)上に構築されており、構造化された多言語ドキュメントの作成を自動化します。このプロセスにより、ドキュメントの作成と保守にかかる手作業が削減され、コードベースとの同期が確保されます。

以下の図は、DocSmithのハイレベルなワークフローを示しています。

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

docsmith: "AIGNE DocSmithエンジン" {
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
source_code -> docsmith: "1. コードを分析"
docsmith -> published_docs: "2. 生成と公開"

# DocSmith Internal Process
subflow: {
  direction: down
  
  analyze: "構造の分析と計画"
  generate: "コンテンツの生成"
  translate: "翻訳（オプション）"
  publish: "公開"
  
  analyze -> generate -> translate -> publish
}

docsmith.subflow: subflow
```

## 主な機能

DocSmithは、ドキュメント作成プロセスを自動化し、簡素化するための一連の機能を提供します。

*   **構造計画:** コードベースを分析して、論理的なドキュメント構造を生成します。
*   **コンテンツ生成:** 計画されたドキュメント構造に、ソースコードから生成されたコンテンツを埋め込みます。
*   **多言語サポート:** ドキュメントを英語、中国語、スペイン語を含む12言語に翻訳します。
*   **AIGNE Hub統合:** Google、OpenAI、Anthropicなどのさまざまな大規模言語モデル（LLM）へのアクセスを提供するサービスである[AIGNE Hub](https://www.aigne.io/en/hub)を使用し、個別のAPIキーを管理することなくモデルを切り替えることができます。
*   **ワンクリック公開:** 共有可能なリンクでドキュメントを公開します。公式プラットフォームに公開するか、[Discuss Kit](https://www.web3kit.rocks/discuss-kit)を使用して独自のインスタンスを実行できます。
*   **反復的な更新:** ソースコードの変更を検知してドキュメントを更新し、ユーザーのフィードバックに基づいて特定のドキュメントのターゲット再生成をサポートします。

## AIGNEエコシステムの一部

DocSmithは、AIアプリケーション開発のためのプラットフォームである[AIGNE](https://www.aigne.io)エコシステムのコンポーネントです。他のAIGNEコンポーネントと統合し、プラットフォームのAI機能とインフラストラクチャを利用します。

以下の図は、DocSmithがAIGNEアーキテクチャ内でどのように位置づけられているかを示しています。

![AIGNEエコシステムのアーキテクチャ](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 次のステップ

DocSmithの使用を開始するには、インストールおよび設定ガイドに進んでください。

<x-card data-title="次へ：はじめに" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="ガイドを開始">
ステップバイステップのガイドに従って、ツールをインストールし、最初のプロジェクトを設定し、ドキュメントを生成します。
</x-card>