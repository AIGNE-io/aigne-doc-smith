# ドキュメントの生成

`aigne doc generate`コマンドは、ソースコードから完全なドキュメントセットを作成するための主要な機能です。このコマンドは、コードベースを分析し、論理的なドキュメント構造を計画し、各セクションのコンテンツを生成するプロセスを開始します。これは、初期状態からドキュメントを作成するための標準的な方法です。

## 最初の生成

開始するには、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自動設定

プロジェクトでこのコマンドを初めて実行する場合、DocSmithは設定が存在しないことを検出します。その後、必要な設定手順を案内する対話式のセットアップウィザードが自動的に起動します。このプロセスにより、生成が開始される前に有効な設定が確実に配置されます。

![generateコマンドを初めて実行するとセットアップウィザードがトリガーされます](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

ドキュメントの主要な側面を定義するための一連の質問に答えるよう求められます。これには以下が含まれます。

- ドキュメントの生成ルールとスタイル
- 対象読者
- 主要言語および追加の翻訳言語
- ソースコードの入力パスとドキュメントの出力パス

![質問に答えて、ドキュメントのスタイル、言語、ソースパスを設定します](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定が完了すると、DocSmithはドキュメントの生成に進みます。

![DocSmithがコードを分析し、構造を計画し、各ドキュメントを生成します](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

正常に完了すると、新しく作成されたドキュメントは、セットアップ中に指定された出力ディレクトリで利用可能になります。

![完了すると、指定した出力ディレクトリに新しいドキュメントが見つかります](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 生成プロセス

`generate`コマンドは、自動化されたマルチステップのワークフローを実行します。プロセスは以下に概説されています。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Config-Check: {
  label: "設定が\n存在しますか？"
  shape: diamond
}

Setup-Wizard: {
  label: "対話式\nセットアップウィザード"
}

Generation-Process: {
  label: "生成プロセス"
  grid-columns: 1

  Analyze: { label: "コードベースの分析" }
  Plan: { label: "構造の計画" }
  Generate: { label: "コンテンツの生成" }
}

Source-Code: {
  label: "ソースコード"
  shape: cylinder
}

Config-File: {
  label: "config.yaml"
  shape: cylinder
}

Output-Directory: {
  label: "出力ディレクトリ"
  shape: cylinder
}

User -> AIGNE-CLI: "1. aigne doc generate"
AIGNE-CLI -> Config-Check: "2. 設定の確認"

Config-Check -> Setup-Wizard: "3a. いいえ"
Setup-Wizard -> User: "入力を要求"
User -> Setup-Wizard: "回答を提供"
Setup-Wizard -> Config-File: "作成"
Config-File -> Generation-Process: "使用"
Setup-Wizard -> Generation-Process: "4. 続行"

Config-Check -> Generation-Process: "3b. はい"

Source-Code -> Generation-Process.Analyze: "入力"
Generation-Process.Analyze -> Generation-Process.Plan
Generation-Process.Plan -> Generation-Process.Generate
Generation-Process.Generate -> Output-Directory: "5. ドキュメントを書き込む"

Output-Directory -> User: "6. ドキュメントを確認"
```

## コマンドオプション

デフォルトの `generate` コマンドはほとんどのユースケースで十分です。ただし、その動作を変更するためのいくつかのオプションが利用可能であり、これらは完全な再生成を強制したり、ドキュメントの構造を洗練させたりするのに役立ちます。

| オプション | 説明 | 例 |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `--forceRegenerate` | 既存のすべてのドキュメントを削除し、ゼロから再生成します。ソースコードや設定に大幅な変更を加えた後に使用します。 | `aigne doc generate --forceRegenerate`                   |
| `--feedback`        | セクションの追加、削除、再編成など、ドキュメント全体の構造を洗練させるための高レベルのフィードバックを提供します。               | `aigne doc generate --feedback "APIリファレンスセクションを追加"` |
| `--model`           | コンテンツ生成に使用するAIGNE Hubの特定の大規模言語モデルを指定します。これにより、異なるモデルを切り替えることができます。    | `aigne doc generate --model openai:gpt-4o`               |

## 次のステップ

最初のドキュメントを生成した後も、プロジェクトは進化し続けます。ドキュメントをコードと同期させるためには、更新を実行する必要があります。次のセクションでは、新しい要件やコードの変更に基づいて、対象を絞った変更を行い、特定のファイルを再生成する方法について説明します。

<x-card data-title="更新と改良" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
コードが変更されたときにドキュメントを更新する方法や、フィードバックを使用して特定の改善を行う方法を学びます。
</x-card>