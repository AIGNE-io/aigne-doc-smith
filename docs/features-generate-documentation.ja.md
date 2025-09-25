# ドキュメントの生成

`aigne doc generate`コマンドは、ソースコードから完全なドキュメントセットを作成するための中核機能です。このプロセスでは、コードベースを分析し、論理的なドキュメント構造を計画し、各セクションのコンテンツを生成します。これは、ドキュメントをゼロから作成するための主要な方法です。

## 最初の生成

まず、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash
aigne doc generate
```

### 自動設定

このコマンドをプロジェクトで初めて実行すると、DocSmithは設定が存在しないことを検出し、対話型のセットアップウィザードを起動して初期設定を案内します。これにより、生成を開始する前に環境が適切に設定されていることを確認できます。

![初めてgenerateコマンドを実行するとセットアップウィザードがトリガーされます](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

以下を定義するための一連の質問が表示されます。

- ドキュメントの生成ルールとスタイル
- 対象読者
- プライマリ言語と翻訳言語
- ソースコードと出力パス

![質問に答えて、ドキュメントのスタイル、言語、ソースパスを設定します](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定が完了すると、DocSmithはドキュメントの生成に進みます。

![DocSmithがコードを分析し、構造を計画し、各ドキュメントを生成します](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

正常に完了すると、新しく作成されたドキュメントが指定した出力ディレクトリで利用可能になります。

![完了すると、指定した出力ディレクトリに新しいドキュメントが見つかります](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 生成プロセス

`generate`コマンドは、自動化されたワークフローに従います。プロセスは次のように視覚化できます。

```d2
direction: down

start: "開始" {
  shape: oval
}

run_cmd: "`aigne doc generate` を実行" {
  shape: rectangle
}

check_config: "設定は存在するか？" {
  shape: diamond
}

interactive_setup: "対話型セットアップウィザードを起動" {
  shape: rectangle
}

plan_structure: "1. コードを分析し、構造を計画" {
  shape: rectangle
}

gen_content: "2. ドキュメントコンテンツを生成" {
  shape: rectangle
}

save_docs: "3. ドキュメントを保存" {
  shape: rectangle
}

end: "終了" {
  shape: oval
}

start -> run_cmd
run_cmd -> check_config
check_config -> interactive_setup: "いいえ"
interactive_setup -> plan_structure
check_config -> plan_structure: "はい"
plan_structure -> gen_content
gen_content -> save_docs
save_docs -> end
```

## コマンドオプション

デフォルトの`generate`コマンドはほとんどのユースケースで十分ですが、生成プロセスを制御するためにいくつかのオプションを使用できます。これらは、コンテンツの再生成やドキュメント構造の改良に役立ちます。

| オプション          | 説明                                                                                                                                     | 例                                                                   |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | 既存のすべてのドキュメントを削除し、ゼロから再生成します。ソースコードや設定に大幅な変更を加えた後に使用します。 | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | セクションの追加、削除、再編成など、ドキュメント全体の構造を改良するための高レベルなフィードバックを提供します。           | `aigne doc generate --feedback "APIリファレンスセクションを追加"`         |
| `--model`           | AIGNE Hubから特定の 大規模言語モデルを指定してコンテンツ生成に使用し、モデル間の切り替えを可能にします。       | `aigne doc generate --model claude:claude-3-5-sonnet`                |

## 次のステップ

初期のドキュメントを生成した後も、プロジェクトは進化し続けます。ドキュメントをコードと同期させるためには、更新が必要です。次のセクションに進み、対象を絞った変更を行い、特定のファイルを再生成する方法を学びましょう。

<x-card data-title="更新と改良" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  コードが変更された際のドキュメントの更新方法や、フィードバックを使用して特定の改善を行う方法を学びます。
</x-card>