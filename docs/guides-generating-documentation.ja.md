# ドキュメントの生成

このガイドでは、プロジェクトのソースファイルから完全なドキュメント一式を作成するための体系的な手順を説明します。このプロセスは `aigne doc generate` コマンドを使用して開始します。このコマンドはコードベースを分析し、論理的な構造を提案し、各ドキュメントのコンテンツを書き込みます。

このコマンドは、ドキュメントを最初に作成するための主要なツールです。作成済みのドキュメントを修正する場合は、[ドキュメントの更新](./guides-updating-documentation.md)ガイドを参照してください。

### 生成ワークフロー

`generate` コマンドは、ドキュメントを構築するための一連の自動化されたステップを実行します。このプロセスは対話形式で設計されており、コンテンツが書き込まれる前に、提案された構造を確認・承認できます。

```d2
direction: down

start: {
  label: "開始"
  shape: oval
}

run_command: {
  label: "'aigne doc generate' を実行"
  shape: rectangle
}

check_config: {
  label: "設定ファイルは存在するか？"
  shape: diamond
}

interactive_setup: {
  label: "対話型セットアップをガイド"
  shape: rectangle
  tooltip: ".aigne/doc-smith/config.yaml が見つからない場合、対話型セットアップがトリガーされます。"
}

propose_structure: {
  label: "プロジェクトを分析し、ドキュメント構造を提案"
  shape: rectangle
}

review_structure: {
  label: "ユーザーが提案された構造を確認"
  shape: rectangle
}

user_approve: {
  label: "構造を承認するか？"
  shape: diamond
}

provide_feedback: {
  label: "構造を洗練させるためのフィードバックを提供"
  shape: rectangle
  tooltip: "ユーザーはセクションの名前変更、追加、削除などの変更を要求できます。"
}

generate_content: {
  label: "すべてのドキュメントのコンテンツを生成"
  shape: rectangle
}

end: {
  label: "終了"
  shape: oval
}

start -> run_command
run_command -> check_config
check_config -> interactive_setup: {
  label: "いいえ"
}
interactive_setup -> propose_structure
check_config -> propose_structure: {
  label: "はい"
}
propose_structure -> review_structure
review_structure -> user_approve
user_approve -> provide_feedback: {
  label: "いいえ"
}
provide_feedback -> review_structure
user_approve -> generate_content: {
  label: "はい"
}
generate_content -> end
```

## ステップバイステップのプロセス

ドキュメントを生成するには、ターミナルでプロジェクトのルートディレクトリに移動し、以下の手順に従ってください。

### 1. 生成コマンドの実行

`generate` コマンドを実行してプロセスを開始します。ツールはプロジェクトのファイルと構造の分析から始めます。

```bash 基本的な生成コマンド
aigne doc generate
```

簡潔にするために、エイリアスの `gen` や `g` を使用することもできます。

### 2. ドキュメント構造の確認

分析が完了すると、ツールは提案されたドキュメント構造を表示し、確認を求めます。

```
ドキュメント構造を最適化しますか？
❯ いいえ、問題ありません
  はい、構造を最適化します（例：「はじめに」を「クイックスタート」に名称変更、「APIリファレンス」を「設定」の前に移動するなど）
```

-   **いいえ、問題ありません**: このオプションを選択すると、提案された構造を承認し、直接コンテンツ生成に進みます。
-   **はい、構造を最適化します**: このオプションを選択すると、プランを修正できます。ツールは対話ループでフィードバックを求めます。次のようなプレーンテキストで指示を与えることができます。
    -   `「トラブルシューティング」という新しいドキュメントを追加`
    -   `「レガシー機能」ドキュメントを削除`
    -   `「インストール」を構造の最上部に移動`

    フィードバックのたびに、AIが構造を修正し、再度確認できます。フィードバックを入力せずにEnterキーを押すと、ループを終了して最終的な構造を承認します。

### 3. コンテンツの生成

ドキュメント構造が承認されると、DocSmithはプラン内の各ドキュメントの詳細なコンテンツの生成を開始します。このプロセスは自動的に実行され、所要時間はプロジェクトの規模と複雑さによって異なります。

完了すると、生成されたファイルは設定で指定された出力ディレクトリ（例：`./docs`）に保存されます。

## コマンドパラメータ

`generate` コマンドは、その動作を制御するためのいくつかのオプションパラメータを受け入れます。

| パラメータ | 説明 | 例 |
|---|---|---|
| `--forceRegenerate` | 既存の構造やコンテンツをすべて無視して、すべてのドキュメントを最初から再構築します。完全にリセットしたい場合に便利です。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 対話型の確認が始まる前に、構造生成フェーズでAIをガイドするための初期のテキストベースの指示を提供します。 | `aigne doc generate --feedback "Add more API examples"` |
| `--glossary` | 用語集ファイル（例：`glossary.md`）を指定して、ドキュメント全体で一貫した用語の使用を保証します。 | `aigne doc generate --glossary @/path/to/glossary.md` |

### 例：完全な再構築の強制

以前に生成されたすべてのドキュメントを破棄し、コードの現在の状態に基づいて新しいセットを作成したい場合は、`--forceRegenerate` フラグを使用します。

```bash 再構築の強制
aigne doc generate --forceRegenerate
```

## まとめ

`generate` コマンドは、初期プロジェクトドキュメントを作成するプロセス全体を統括します。自動化されたコード分析と対話型の確認プロセスを組み合わせることで、構造化された関連性の高いドキュメント一式を生成します。

ドキュメントが生成されたら、次のような操作ができます。

-   [ドキュメントの更新](./guides-updating-documentation.md): 特定のドキュメントに変更を加える。
-   [ドキュメントの翻訳](./guides-translating-documentation.md): コンテンツを他の言語に翻訳する。
-   [ドキュメントの公開](./guides-publishing-your-docs.md): ドキュメントをオンラインで利用可能にする。