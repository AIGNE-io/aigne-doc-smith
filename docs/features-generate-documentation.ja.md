# ドキュメントの生成

`aigne doc generate` コマンドは、ソースコードから完全なドキュメントセットを作成するための主要な機能です。このコマンドは、コードベースを分析し、論理的なドキュメント構造を計画し、各セクションのコンテンツを生成するプロセスを開始します。これは、初期状態からドキュメントを作成するための標準的な方法です。

## 最初の生成

まず、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自動設定

プロジェクトでこのコマンドを初めて実行する場合、DocSmith は設定が存在しないことを検出します。その後、対話式のセットアップウィザードが自動的に起動し、必要な設定手順を案内します。このプロセスにより、生成が開始される前に有効な設定が確実に配置されます。

![generate コマンドの実行、初期化のスマートな実行](../assets/screenshots/doc-generate.png)

ドキュメントの主要な側面を定義するための一連の質問に答えるよう求められます。これには以下が含まれます。

*   ドキュメント生成ルールとスタイル
*   対象読者
*   主要言語と追加の翻訳言語
*   ソースコードの入力パスとドキュメントの出力パス

![質問に答えてプロジェクトのセットアップを完了](../assets/screenshots/doc-complete-setup.png)

設定が完了すると、DocSmith はドキュメントの生成に進みます。

![構造計画の実行とドキュメントの生成](../assets/screenshots/doc-generate-docs.png)

正常に完了すると、新しく作成されたドキュメントは、セットアップ中に指定された出力ディレクトリで利用可能になります。

![ドキュメントが正常に生成されました](../assets/screenshots/doc-generated-successfully.png)

## 生成プロセス

`generate` コマンドは、自動化されたマルチステップのワークフローを実行します。プロセスは以下の通りです。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"

  config-check: {
    label: "設定ファイルは存在しますか？"
    shape: diamond
  }

  interactive-setup: {
    label: "対話式セットアップウィザード"
  }

  generation-process: {
    label: "3. 生成プロセス"

    analyze-code: "コードの分析"
    plan-structure: "構造の計画"
    generate-content: "コンテンツの生成"

    analyze-code -> plan-structure -> generate-content
  }

  output: {
    label: "出力ディレクトリ"
  }
}

User -> AIGNE-CLI.config-check: "'aigne doc generate'"
AIGNE-CLI.config-check -> AIGNE-CLI.interactive-setup: "[いいえ] 2. セットアップの開始"
AIGNE-CLI.interactive-setup -> AIGNE-CLI.generation-process: "設定ファイルの作成"
AIGNE-CLI.config-check -> AIGNE-CLI.generation-process: "[はい]"
AIGNE-CLI.generation-process -> AIGNE-CLI.output: "4. ドキュメントの書き込み"
```

## コマンドオプション

デフォルトの `generate` コマンドは、ほとんどのユースケースで十分です。しかし、その動作を変更するためのいくつかのオプションが利用可能で、完全な再生成を強制したり、ドキュメント構造を洗練させたりするのに役立ちます。

| オプション          | 説明                                                                                                                                           | 例                                                     |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `--forceRegenerate` | 既存のドキュメントをすべて削除し、最初から再生成します。ソースコードや設定に大幅な変更を加えた後に使用してください。                                       | `aigne doc generate --forceRegenerate`                   |
| `--feedback`        | セクションの追加、削除、再編成など、ドキュメント全体の構造を洗練させるための大まかなフィードバックを提供します。                                           | `aigne doc generate --feedback "APIリファレンスを追加"`   |
| `--model`           | コンテンツ生成に使用するAIGNE Hubの特定の大規模言語モデルを指定し、異なるモデルを切り替えることができます。                                                  | `aigne doc generate --model openai:gpt-4o`               |

## 次のステップ

最初のドキュメントを生成した後も、プロジェクトは進化し続けます。ドキュメントをコードと同期させるためには、更新を行う必要があります。次のセクションでは、新しい要件やコードの変更に基づいて、対象を絞った変更を行い、特定のファイルを再生成する方法について説明します。

<x-card data-title="更新と改良" data-icon="lucide:file-edit" data-href="/features/update-and-refine">コードが変更された際のドキュメントの更新方法や、フィードバックを用いた特定の改善方法について学びます。</x-card>