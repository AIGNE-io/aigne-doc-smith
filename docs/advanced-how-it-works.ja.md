# 仕組み

AIGNE DocSmithは、マルチagentシステムで動作します。単一のモノリシックなプロセスではなく、専門のAI agentのパイプラインを編成し、各agentが特定のタスクを担当します。このアプローチにより、ソースコードを完全なドキュメントに変換するための構造化されたモジュラーなプロセスが可能になります。

このツールは、AIアプリケーションを開発・展開するためのプラットフォームを提供する、より大きなAIGNEエコシステムの不可欠な部分です。

![AIGNEエコシステムのアーキテクチャ](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## ドキュメント生成パイプライン

DocSmithの中核は、ソースコードをいくつかの異なるステージを通して処理するパイプラインです。各ステージは1つ以上の専用agentによって管理されます。通常、`aigne doc generate`コマンドによって開始される主要なワークフローは、次のように視覚化できます。

```d2
direction: down

Input: {
  label: "ソースコードと設定"
  shape: rectangle
}

Pipeline: {
  label: "コア生成パイプライン"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. 構造計画"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. コンテンツ生成"
    shape: rectangle
  }

  Saving: {
    label: "3. ドキュメント保存"
    shape: rectangle
  }
}

User-Feedback: {
  label: "ユーザーフィードバックループ\n(--feedbackフラグ経由)"
  shape: rectangle
}

Optional-Steps: {
  label: "オプションの生成後ステップ"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "翻訳\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "公開\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "構造の改良"
User-Feedback -> Pipeline.Content-Generation: "コンテンツの再生成"
```

1.  **入力分析**: このプロセスは、agentがソースコードとプロジェクト設定（`aigne.yaml`）を読み込むことから始まります。

2.  **構造計画**: あるagentがコードベースを分析し、論理的なドキュメント構造を提案します。プロジェクトの構成と指定されたルールに基づいてアウトラインを作成します。

3.  **コンテンツ生成**: 構造が決定されると、コンテンツ生成agentがドキュメントプランの各セクションに詳細なテキスト、コード例、説明を埋め込んでいきます。

4.  **改良と更新**: `aigne doc update`または`aigne doc generate --feedback`を介して入力が提供されると、特定のagentがアクティブになり、個々のドキュメントを更新したり、全体の構造を調整したりします。

5.  **翻訳と公開**: 主要なコンテンツが生成された後、オプションのagentが多言語翻訳や最終的なドキュメントをウェブプラットフォームに公開するなどのタスクを処理します。

## 主要なAI Agent

DocSmithの機能は、プロジェクトの設定で定義されたagentのコレクションによって提供されます。各agentには特定の役割があります。以下の表は、主要なagentとその機能の一部をリストアップしたものです。

| 機能的役割 | 主要なAgentファイル | 説明 |
| :--- | :--- | :--- |
| **構造計画** | `generate/generate-structure.yaml` | ソースコードを分析し、最初のドキュメントアウトラインを提案します。 |
| **構造の改良** | `generate/refine-document-structure.yaml` | ユーザーのフィードバックに基づいてドキュメントの構造を修正します。 |
| **コンテンツ生成** | `update/batch-generate-document.yaml`, `update/generate-document.yaml` | ドキュメント構造の各セクションに詳細なコンテンツを埋め込みます。 |
| **翻訳** | `translate/translate-document.yaml`, `translate/translate-multilingual.yaml` | 生成されたドキュメントを複数のターゲット言語に翻訳します。 |
| **公開** | `publish/publish-docs.mjs` | ドキュメントをDiscuss Kitインスタンスに公開するプロセスを管理します。 |
| **データI/O** | `utils/load-sources.mjs`, `utils/save-docs.mjs` | ソースファイルの読み込みと、最終的なマークダウンドキュメントのディスクへの書き込みを担当します。 |

このagentベースのアーキテクチャにより、ドキュメント化プロセスの各ステップを専門のツールで処理できるため、構造化され、保守可能なワークフローが保証されます。

---

DocSmithが出力の正確性と形式を保証するために講じている対策を理解するには、[品質保証](./advanced-quality-assurance.md)のセクションに進んでください。