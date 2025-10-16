# ドキュメントの翻訳

DocSmith を使用すると、ドキュメントを複数の言語に翻訳し、コンテンツを世界中のオーディエンスに届けることができます。翻訳プロセスは、AI を活用して文脈を考慮した技術的に正確な翻訳を提供することで、簡単に行えるように設計されています。このガイドでは、`translate` コマンドを使用してドキュメントを翻訳する手順を詳しく説明します。

DocSmith は 12 言語のプロフェッショナルな翻訳をサポートしており、海外のユーザーを幅広くカバーします。

## ドキュメントの翻訳方法

翻訳の主要なコマンドは `aigne doc translate` です。インタラクティブに実行して翻訳したいドキュメントと言語を選択することも、コマンドラインフラグを使用してこれらのオプションを直接指定してワークフローを自動化することもできます。

### インタラクティブモード

ガイド付きのエクスペリエンスを利用するには、引数なしでコマンドを実行するだけです。

```bash
aigne doc translate
```

ツールは、次のことを行うように要求します:
1.  既存のドキュメントのリストから翻訳したい**ドキュメントを選択**します。
2.  翻訳の**ターゲット言語を選択**します。以前に選択した言語は、便宜上、事前にチェックされています。

![translate コマンドの実行](../assets/screenshots/doc-translate.png)

ドキュメントを選択すると、利用可能な言語のリストが表示されます。

![翻訳言語の選択](../assets/screenshots/doc-translate-langs.png)

選択を確定すると、DocSmith は各ドキュメントの各選択言語への翻訳を進めます。

### コマンドラインの使用法

より直接的な制御やスクリプトでの使用のために、フラグを使用して要件を指定できます。

```bash
aigne doc translate [options]
```

#### オプション

`translate` コマンドでは、以下のオプションが利用できます:

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳するドキュメントのパスを 1 つ以上指定します。指定しない場合、インタラクティブにリストから選択するように求められます。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>ターゲット言語のコード (例: `zh`, `ja`) を 1 つ以上指定します。指定しない場合、インタラクティブに言語を選択できます。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>すべての翻訳で一貫した用語を保証するための用語集ファイルへのパス (例: `@/path/to/glossary.md`)。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>AI の翻訳スタイルをガイドするための具体的な指示やフィードバックを提供します (例:「フォーマルなトーンを使用し、技術用語は英語のままにしてください」)。このフィードバックはドキュメントの履歴に記録されます。</x-field-desc>
  </x-field>
</x-field-group>

#### 例

`overview.md` と `getting-started.md` ドキュメントを中国語と日本語に翻訳するには、次のコマンドを実行します:

```bash
aigne doc translate --docs /overview.md --docs /getting-started.md --langs zh ja
```

文体に関するフィードバックを提供し、一貫した用語を確保するには、`--feedback` と `--glossary` フラグを追加します:

```bash
aigne doc translate --docs /overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 対応言語

DocSmith は以下の 12 言語のプロフェッショナルな翻訳を提供します。`--langs` フラグで言語を指定する際は、対応するコードを使用してください。

| 言語 | コード |
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

これで、`aigne doc translate` コマンドを使用して、インタラクティブなプロセスまたは自動化のためのコマンドラインオプションを使用して、ドキュメントを多言語で利用可能にする方法を学びました。

ドキュメントを翻訳した後、次の論理的なステップは、それらをユーザーが利用できるようにすることです。その方法については、[ドキュメントの公開](./guides-publishing-your-docs.md) ガイドを参照してください。