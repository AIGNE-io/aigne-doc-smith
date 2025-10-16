# ドキュメントの翻訳

DocSmithを使用すると、ドキュメントを複数の言語に翻訳でき、コンテンツを世界中の読者がアクセスできるようになります。翻訳プロセスは簡単になるように設計されており、AIを活用して文脈を理解し、技術的に正確な翻訳を提供します。このガイドでは、`translate`コマンドを使用してドキュメントを翻訳する手順を詳しく説明します。

DocSmithは12言語のプロフェッショナルな翻訳をサポートしており、海外のユーザーを幅広くカバーします。

## ドキュメントの翻訳方法

翻訳の主要なコマンドは `aigne doc translate` です。対話形式で実行して、どのドキュメントと言語を選択するか、またはコマンドラインフラグを使用してこれらのオプションを直接指定して自動化されたワークフローに対応できます。

### 対話モード

ガイド付きの体験には、引数なしでコマンドを実行するだけです。

```bash
aigne doc translate
```

ツールは次のようにプロンプトを表示します：
1.  **ドキュメントの選択**: 既存のドキュメントのリストから翻訳したいドキュメントを選択します。
2.  **ターゲット言語の選択**: 翻訳先の言語を選択します。以前に選択した言語は、便宜上あらかじめチェックされています。

![translate コマンドの実行](../assets/screenshots/doc-translate.png)

ドキュメントを選択すると、利用可能な言語のリストが表示されます。

![翻訳言語の選択](../assets/screenshots/doc-translate-langs.png)

選択を確定すると、DocSmithは各ドキュメントを各選択言語に翻訳する処理を開始します。

### コマンドラインでの使用方法

より直接的な制御やスクリプトでの使用のために、フラグを使用して要件を指定できます。

```bash
aigne doc translate [options]
```

#### オプション

`translate` コマンドで利用可能なオプションは以下の通りです：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳するドキュメントのパスを1つ以上指定します。指定しない場合、対話形式でリストから選択するよう促されます。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>ターゲット言語のコード（例：`zh`, `ja`）を1つ以上指定します。指定しない場合、対話形式で言語を選択できます。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>すべての翻訳で一貫した用語を保証するための用語集ファイルへのパス（例：`@/path/to/glossary.md`）。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>AIの翻訳スタイルをガイドするための具体的な指示やフィードバックを提供します（例：「フォーマルなトーンを使用し、技術用語は英語のままにしてください」）。このフィードバックはドキュメントの履歴に記録されます。</x-field-desc>
  </x-field>
</x-field-group>

#### 例

`overview.md` と `getting-started.md` ドキュメントを中国語と日本語に翻訳するには、次のコマンドを実行します：

```bash
aigne doc translate --docs /overview --docs /getting-started --langs zh ja
```

文体に関するフィードバックを提供し、一貫した用語を保証するには、`--feedback` と `--glossary` フラグを追加します：

```bash
aigne doc translate --docs /overview --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 対応言語

DocSmithは以下の12言語のプロフェッショナルな翻訳を提供します。`--langs` フラグで言語を指定する際は、対応するコードを使用してください。

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

これで、`aigne doc translate` コマンドを使用して、対話的なプロセスまたは自動化のためのコマンドラインオプションを使用して、ドキュメントを多言語で利用可能にする方法を学びました。

ドキュメントを翻訳した後、次の論理的なステップは、それらをユーザーが利用できるようにすることです。その方法については、[ドキュメントの公開](./guides-publishing-your-docs.md)ガイドを参照してください。