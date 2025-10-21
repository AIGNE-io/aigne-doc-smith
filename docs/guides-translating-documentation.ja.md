# ドキュメントの翻訳

DocSmith を使用すると、ドキュメントを複数の言語に翻訳し、コンテンツを世界中のユーザーがアクセスできるようにすることができます。翻訳プロセスは、AI を活用して文脈を考慮した技術的に正確な翻訳を提供することで、簡単に行えるように設計されています。このガイドでは、`translate` コマンドを使用してドキュメントを翻訳する手順について詳しく説明します。

DocSmith は 12 言語のプロフェッショナルな翻訳をサポートしており、海外のユーザーを幅広くカバーします。

## ドキュメントの翻訳方法

翻訳の主要なコマンドは `aigne doc translate` です。対話形式で実行して、どのドキュメントや言語を翻訳するかを選択することも、コマンドラインフラグを使用してこれらのオプションを直接指定して、自動化されたワークフローに対応することもできます。

### 対話モード

ガイド付きの体験をしたい場合は、引数なしでコマンドを実行するだけです。

```bash
aigne doc translate
```

ツールは次のことを尋ねてきます：
1.  **翻訳したいドキュメントを選択します**。既存のドキュメントのリストから選びます。
2.  翻訳の**対象言語を選択します**。以前に選択した言語は、便宜上、事前にチェックされています。

![translate コマンドの実行](../assets/screenshots/doc-translate.png)

ドキュメントを選択すると、利用可能な言語のリストが表示されます。

![翻訳言語の選択](../assets/screenshots/doc-translate-langs.png)

選択を確定すると、DocSmith は各ドキュメントを各選択言語に翻訳する作業を進めます。

### コマンドラインの使用

より直接的な制御やスクリプトでの使用のために、フラグを使用して要件を指定できます。

```bash
aigne doc translate [options]
```

#### オプション

`translate` コマンドで利用可能なオプションは次のとおりです：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳する1つ以上のドキュメントパスを指定します。指定しない場合、対話形式でリストから選択するよう求められます。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>1つ以上の対象言語コード（例：`zh`、`ja`）を指定します。指定しない場合、対話形式で言語を選択できます。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>すべての翻訳で一貫した用語を保証するための用語集ファイル（例：`@/path/to/glossary.md`）へのパス。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>AIの翻訳スタイルをガイドするための具体的な指示やフィードバックを提供します（例：「フォーマルなトーンを使用し、技術用語は英語のままにしてください」）。このフィードバックはドキュメントの履歴に記録されます。</x-field-desc>
  </x-field>
</x-field-group>

#### 例

`overview.md` と `getting-started.md` ドキュメントを中国語と日本語に翻訳するには、次のコマンドを実行します：

```bash
aigne doc translate --docs overview.md --docs getting-started.md --langs zh ja
```

文体に関するフィードバックを提供し、一貫した用語を確保するために、`--feedback` と `--glossary` フラグを追加できます：

```bash
aigne doc translate --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## サポートされている言語

DocSmith は、以下の12言語のプロフェッショナルな翻訳を提供しています。`--langs` フラグで言語を指定する際は、対応するコードを使用してください。

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

これで、対話的なプロセスまたは自動化のためのコマンドラインオプションを使用して、`aigne doc translate` コマンドを使ってドキュメントを多言語で利用可能にする方法を学びました。

ドキュメントを翻訳した後、次の論理的なステップは、それらをユーザーに利用可能にすることです。その方法については、[ドキュメントの公開](./guides-publishing-your-docs.md)ガイドを参照してください。