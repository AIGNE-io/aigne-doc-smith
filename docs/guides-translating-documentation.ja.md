# ドキュメントの翻訳

ドキュメントを多言語で利用できるようにすることは、グローバルなオーディエンスにリーチするために不可欠です。このガイドでは、`aigne doc translate` コマンドを使用してコンテンツをサポートされている12の言語のいずれかに翻訳するためのステップバイステップのプロセスを提供し、世界中のユーザーがドキュメントにアクセスしやすく、理解しやすいようにします。

## 翻訳プロセスの概要

ドキュメントを翻訳するための主要なコマンドは `aigne doc translate` です。このコマンドは、インタラクティブモードまたは非インタラクティブモード（コマンドラインフラグを使用）の2つのモードで実行できます。どちらの方法も直感的になるように設計されており、単一または多言語の翻訳を効率的に管理できます。

### インタラクティブモード

ガイド付きの体験をしたい場合は、引数なしでコマンドを実行してください。これは、翻訳機能を初めて使用するユーザーや、ステップバイステップのプロセスを好むユーザーにおすすめの方法です。

```bash icon=lucide:terminal
aigne doc translate
```

このコマンドを実行すると、DocSmithはインタラクティブセッションを開始します：

1.  まず、プロジェクト内の利用可能なすべてのドキュメントファイルのリストから、翻訳したい特定のドキュメントを選択するよう求められます。
2.  次に、ターゲット言語を選択するよう求められます。システムは12言語をサポートしており、以前に選択した言語はプロセスを効率化するために事前にチェックされています。

![翻訳コマンドの実行](../assets/screenshots/doc-translate.png)

ドキュメントを選択した後、利用可能な言語のリストが表示され、そこから選択します。

![翻訳言語の選択](../assets/screenshots/doc-translate-langs.png)

選択が確定すると、DocSmithは選択した各ドキュメントを、選択したすべての言語に翻訳するプロセスを開始します。

### コマンドラインの使用法

自動化、スクリプト作成、またはより直接的な制御のためには、コマンドラインで直接引数を指定できます。

```bash icon=lucide:terminal
aigne doc translate [options]
```

#### オプション

`translate` コマンドは、ドキュメント、言語、およびその他の設定を指定するために、以下のオプションを受け入れます。

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳する1つ以上のドキュメントパスを指定します。このオプションを省略した場合、ツールはドキュメント選択のためのインタラクティブモードに入ります。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>ターゲット言語コードのリスト（例：`zh`、`ja`、`de`）。指定しない場合、インタラクティブに言語を選択するよう求められます。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>用語集ファイルへのパス（例：`@/path/to/glossary.md`）。このファイルは、すべての翻訳にわたって特定の用語の用語統一を維持するのに役立ちます。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>AIに特定の指示を与え、その翻訳スタイルをガイドします（例：「フォーマルなトーンを使用し、技術用語は英語のままにしてください」）。このフィードバックは、将来の参照のためにドキュメントの履歴にも記録されます。</x-field-desc>
  </x-field>
</x-field-group>

#### 例

1.  **特定のドキュメントを複数の言語に翻訳する：**

    `overview.md` と `getting-started.md` を中国語と日本語に翻訳するには、次のコマンドを使用します：
    ```bash icon=lucide:terminal
    aigne doc translate --docs overview.md --docs getting-started.md --langs zh ja
    ```

2.  **用語集とスタイルに関するフィードバックを使用して翻訳する：**

    `overview.md` をドイツ語に翻訳し、用語の一貫性とフォーマルなトーンを確保するには、`--glossary` と `--feedback` オプションを含めることができます：
    ```bash icon=lucide:terminal
    aigne doc translate --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
    ```

## サポートされている言語

DocSmithは、12言語のプロフェッショナルレベルの翻訳を提供します。`--langs` フラグを使用する際は、以下の表の言語コードを使用してください。

| Language | Code |
|---|---|
| English | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| Español | `es` |
| Français | `fr` |
| Deutsch | `de` |
| Português | `pt` |
| Русский | `ru` |
| Italiano | `it` |
| العربية | `ar` |

## まとめ

このガイドでは、`aigne doc translate` コマンドを使用してドキュメントをグローバルなオーディエンスにアクセス可能にする方法について説明しました。ガイド付きプロセスにはインタラクティブモードを、自動化と精度のためにはコマンドラインオプションを使用できます。

ドキュメントが翻訳されたら、次のステップはそれらを公開することです。このプロセスの詳細な手順については、[ドキュメントの公開](./guides-publishing-your-docs.md)ガイドを参照してください。