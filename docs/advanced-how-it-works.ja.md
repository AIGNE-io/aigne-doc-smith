# 仕組み

AIGNE DocSmithは、AIGNEフレームワーク内に構築されたマルチAgentシステムで動作します。単一のモノリシックなプロセスではなく、専門的なAI Agentのパイプラインを編成し、各Agentが特定のタスクを担当します。このアプローチにより、ソースコードを完全なドキュメンテーションに変換するための、構造化されたモジュラーなプロセスが可能になります。

このツールは、AIアプリケーションの開発とデプロイのためのプラットフォームを提供する、より大きなAIGNEエコシステムの不可欠な部分です。

![AIGNEエコシステムのアーキテクチャ](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## ドキュメンテーション生成パイプライン

DocSmithの中核は、ソースコードをいくつかの異なるステージを通じて処理するパイプラインです。各ステージは、1つ以上の専用Agentによって管理されます。通常 `aigne doc generate` コマンドによって開始される主要なワークフローは、次のように視覚化できます。

```d2
direction: down

Input: {
  label: "Source Code & Config"
  shape: rectangle
}

Pipeline: {
  label: "Core Generation Pipeline"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. Structure Planning"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. Content Generation"
    shape: rectangle
  }

  Saving: {
    label: "3. Save Documents"
    shape: rectangle
  }
}

User-Feedback: {
  label: "User Feedback Loop\n(via --feedback flag)"
  shape: rectangle
}

Optional-Steps: {
  label: "Optional Post-Generation Steps"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "Translate\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "Publish\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "Refine Structure"
User-Feedback -> Pipeline.Content-Generation: "Regenerate Content"
```

1.  **入力分析**: Agentがソースコードとプロジェクト設定（`aigne.yaml`）を読み込むと、プロセスが開始されます。

2.  **構造計画**: Agentがコードベースを分析し、論理的なドキュメント構造を提案します。プロジェクトの構成と指定されたルールに基づいてアウトラインを作成します。

3.  **コンテンツ生成**: 構造が確定すると、コンテンツ生成Agentがドキュメント計画の各セクションに詳細なテキスト、コード例、説明を埋め込みます。

4.  **改良と更新**: `aigne doc update` または `aigne doc generate --feedback` を介して入力を提供すると、特定のAgentがアクティブになり、個々のドキュメントを更新したり、全体的な構造を調整したりします。

5.  **翻訳と公開**: 主要なコンテンツが生成された後、オプションのAgentが多言語翻訳や最終的なドキュメンテーションをウェブプラットフォームに公開するなどのタスクを処理します。

## 主要なAI Agent

DocSmithの機能は、プロジェクトの設定で定義されたAgentのコレクションによって提供されます。各Agentには特定の役割があります。以下の表は、主要なAgentとその機能の一部をリストアップしたものです。

| 機能的役割               | 主要なAgentファイル                                  | 説明                                                                         |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **構造計画**             | `generate/generate-structure.yaml`                   | ソースコードを分析し、初期のドキュメントアウトラインを提案します。                         |
| **構造の改良**           | `generate/refine-document-structure.yaml`            | ユーザーのフィードバックに基づいてドキュメント構造を修正します。                             |
| **コンテンツ生成**         | `update/batch-generate-document.yaml`, `generate-document.yaml` | 各セクションの詳細なコンテンツでドキュメント構造を埋めます。                                 |
| **翻訳**                 | `translate/translate-document.yaml`, `translate-multilingual.yaml` | 生成されたドキュメンテーションを複数のターゲット言語に翻訳します。                           |
| **公開**                 | `publish/publish-docs.mjs`                           | Discuss Kitインスタンスへのドキュメント公開プロセスを管理します。                           |
| **データI/O**              | `utils/load-sources.mjs`, `utils/save-docs.mjs`      | ソースファイルの読み取りと最終的なマークダウンドキュメントのディスクへの書き込みを担当します。 |

このAgentベースのアーキテクチャにより、ドキュメンテーションプロセスの各ステップを専門ツールで処理でき、構造化され保守可能なワークフローが保証されます。

---

DocSmithが出力の正確性とフォーマットを保証するために講じる対策を理解するには、[品質保証](./advanced-quality-assurance.md)のセクションに進んでください。