# 概要

AIGNE DocSmithは、ソースコードから直接ドキュメントを生成するAI駆動のツールです。[AIGNE Framework](https://www.aigne.io/en/framework)上に構築されており、構造化された多言語ドキュメントの作成を自動化します。このプロセスにより、ドキュメントの作成と保守にかかる手作業が削減され、コードベースとの同期が確保されます。

## AIGNEエコシステムの一部

DocSmithは、AIアプリケーション開発プラットフォームである[AIGNE](https://www.aigne.io)エコシステムの主要なコンポーネントです。他のAIGNEコンポーネントと統合し、プラットフォームのAI機能とインフラストラクチャを利用します。

以下の図は、DocSmithがAIGNEアーキテクチャ内でどのように位置づけられるかを示しています。

![AIGNEエコシステムアーキテクチャ](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 主な機能

DocSmithは、ドキュメント作成プロセスを自動化し、簡素化するための一連の機能を提供します。

*   **構造計画：** コードベースを分析して、論理的なドキュメント構造を生成します。
*   **コンテンツ生成：** 計画されたドキュメント構造に、ソースコードから生成されたコンテンツを埋め込みます。
*   **多言語サポート：** 英語、中国語、日本語、スペイン語を含む12言語にドキュメントを翻訳します。
*   **AIGNE Hubとの統合：** [AIGNE Hub](https://www.aigne.io/en/hub)をLLMプロバイダーとして使用し、個別のAPIキーを管理することなくモデルを切り替えることができます。
*   **ドキュメント公開：** 公式プラットフォーム[docsmith.aigne.io](https://docsmith.aigne.io/app/)またはユーザー自身の[Discuss Kit](https://www.arcblock.io/docs/web3-kit/en/discuss-kit)インスタンスにドキュメントを公開します。
*   **反復更新：** ソースコードの変更を検出してドキュメントを更新し、ユーザーのフィードバックに基づいて特定のドキュメントのターゲットを絞った再生成をサポートします。

## 次のステップ

DocSmithの使用を開始するには、インストールおよび設定ガイドに進んでください。

<x-card data-title="次へ：はじめに" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="ガイドを開始">
  ステップバイステップのガイドに従って、ツールをインストールし、最初のプロジェクトを設定して、ドキュメントを生成します。
</x-card>