# ドキュメントの生成

このガイドでは、プロジェクトのソースファイルからドキュメント一式を作成するための体系的な手順を説明します。このプロセスは `aigne doc generate` コマンドを使用して開始されます。このコマンドはコードベースを分析し、論理的な構造を提案し、各ドキュメントのコンテンツを作成します。

このコマンドは、ドキュメントを最初に作成するための主要なツールです。作成後のドキュメントの修正については、[ドキュメントの更新](./guides-updating-documentation.md)ガイドを参照してください。

### 生成のワークフロー

`generate` コマンドは、ドキュメントを構築するための一連の自動化されたステップを実行します。このプロセスは対話形式で設計されており、コンテンツが書き込まれる前に提案された構造を確認し、承認することができます。

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
  label: "設定ファイルが存在するか？"
  shape: diamond
}

interactive_setup: {
  label: "対話型セットアップのガイド"
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
  label: "構造を承認しますか？"
  shape: diamond
}

provide_feedback: {
  label: "構造を改善するためのフィードバックを提供"
  shape: rectangle
  tooltip: "ユーザーは、セクションの名前の変更、追加、削除などの変更を要求できます。"
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

### 1. Generate コマンドの実行

`generate` コマンドを実行してプロセスを開始します。ツールはプロジェクトのファイルと構造の分析から開始します。

```bash 基本的な生成コマンド
aigne doc generate
```

簡潔にするために、エイリアス `gen` または `g` を使用することもできます。

### 2. ドキュメント構造の確認

分析が完了すると、ツールは提案されたドキュメント構造を提示します。この構造は、作成されるドキュメントの階層的な計画です。

この計画を確認するよう求められます。

```
ドキュメントの構造を最適化しますか？
タイトルを編集したり、セクションを再編成したりできます。
❯ 問題ありません - 現在の構造で続行します
  はい、構造を最適化します
```

-   **問題ありません - 現在の構造で続行します**: このオプションを選択すると、提案された構造を承認し、直接コンテンツ生成に進みます。
-   **はい、構造を最適化します**: このオプションは、計画を修正したい場合に選択します。プレーンテキストで、「'API' を 'API リファレンス' に変更」や「'デプロイ' のための新しいセクションを追加」などのフィードバックを提供できます。AI はあなたのフィードバックに基づいて構造を修正し、再度確認することができます。このサイクルは、構造があなたの要件を満たすまで繰り返すことができます。

### 3. コンテンツの生成

ドキュメント構造が承認されると、DocSmith は計画内の各ドキュメントの詳細なコンテンツの生成を開始します。このプロセスは自動的に実行され、その所要時間はプロジェクトの規模と複雑さによって異なります。

完了すると、生成されたファイルは設定で指定された出力ディレクトリ（例：`./docs`）に保存されます。

## コマンドのパラメータ

`generate` コマンドは、その動作を制御するためのいくつかのオプションパラメータを受け入れます。

| パラメータ          | 説明                                                                                                                                     | 例                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `--forceRegenerate` | 既存の構造やコンテンツをすべて無視して、すべてのドキュメントをゼロから再構築します。これは、白紙の状態からやり直す場合に便利です。             | `aigne doc generate --forceRegenerate`                                              |
| `--feedback`        | 構造生成フェーズで AI をガイドするための初期指示を提供します。                                                                             | `aigne doc generate --feedback "API の例を増やし、トラブルシューティングのセクションを追加してください"` |
| `--glossary`        | ドキュメント全体で一貫した用語の使用を保証するために、用語集ファイル（`.md`）を指定します。                                                  | `aigne doc generate --glossary @/path/to/glossary.md`                             |

### 例：完全な再構築を強制する

以前に生成されたすべてのドキュメントを破棄し、コードの現在の状態に基づいて新しいセットを作成したい場合は、`--forceRegenerate` フラグを使用します。

```bash 再生成の強制
aigne doc generate --forceRegenerate
```

## まとめ

`generate` コマンドは、初期プロジェクトドキュメントを作成するプロセス全体を統括します。自動化されたコード分析と対話的なレビュープロセスを組み合わせることで、構造化された関連性の高いドキュメント一式を生成します。

ドキュメントが生成された後、次のことを行うことができます。

-   [ドキュメントの更新](./guides-updating-documentation.md): 特定のドキュメントに変更を加える。
-   [ドキュメントの翻訳](./guides-translating-documentation.md): コンテンツを他の言語に翻訳する。
-   [ドキュメントの公開](./guides-publishing-your-docs.md): ドキュメントをオンラインで利用可能にする。