# ドキュメントの翻訳

DocSmith を使用すると、ドキュメントを複数の言語に翻訳でき、世界中の読者がコンテンツにアクセスできるようになります。翻訳プロセスは、AI を活用して文脈を考慮した技術的に正確な翻訳を提供することで、簡単に行えるように設計されています。このガイドでは、`translate` コマンドを使用してドキュメントを翻訳する手順を詳しく説明します。

DocSmith は 12 言語のプロフェッショナルな翻訳をサポートしており、海外のユーザーを幅広くカバーします。

## ドキュメントの翻訳方法

翻訳の主要なコマンドは `aigne doc translate` です。インタラクティブに実行して、どのドキュメントとどの言語にするかを選択することも、コマンドラインフラグを使用してこれらのオプションを直接指定して、ワークフローを自動化することもできます。

### インタラクティブモード

ガイド付きの操作を行うには、引数なしでコマンドを実行するだけです。

```bash
aigne doc translate
```

ツールは次のプロンプトを表示します:
1.  既存のドキュメントのリストから、翻訳したい**ドキュメントを選択**します。
2.  翻訳の**ターゲット言語を選択**します。以前に選択した言語は、便宜上、事前にチェックされています。

![translate コマンドの実行](https://docsmith.aigne.io/image-bin/uploads/9b47a9f979745a3089c287f73715c0a3.png)

ドキュメントを選択した後、利用可能な言語のリストが表示されます。

![翻訳言語の選択](https://docsmith.aigne.io/image-bin/uploads/c53f880f08a9f65f377038198f1a1d1d.png)

選択を確定すると、DocSmith は各ドキュメントの各選択言語への翻訳を進めます。

### コマンドラインでの使用方法

より直接的な制御やスクリプトでの使用のために、フラグを使用して要件を指定できます。

```bash
aigne doc translate [options]
```

#### オプション

`translate` コマンドで利用できるオプションは次のとおりです:

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳するドキュメントのパスを 1 つ以上指定します。指定しない場合は、インタラクティブにリストから選択するよう求められます。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>ターゲット言語コードを 1 つ以上指定します (例: `zh`, `ja`)。指定しない場合は、インタラクティブに言語を選択できます。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>すべての翻訳で一貫した用語を保証するための用語集ファイルへのパス (例: `@/path/to/glossary.md`)。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>AI の翻訳スタイルをガイドするための具体的な指示やフィードバックを提供します (例: 「フォーマルなトーンを使用し、技術用語は英語のままにしてください」)。このフィードバックはドキュメントの履歴に記録されます。</x-field-desc>
  </x-field>
</x-field-group>

#### 例

`overview.md` と `getting-started.md` ドキュメントを中国語と日本語に翻訳するには、次のコマンドを実行します:

```bash
aigne doc translate --docs /overview --docs /getting-started --langs zh ja
```

文体に関するフィードバックを提供し、一貫した用語を保証するには、`--feedback` と `--glossary` フラグを追加します:

```bash
aigne doc translate --docs /overview --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 対応言語

DocSmith は、以下の 12 言語のプロフェッショナルな翻訳を提供します。`--langs` フラグで言語を指定する際は、対応するコードを使用してください。

| 言語 | コード |
|---|---|
| 英語 | `en` |
| 簡体字中国語 | `zh` |
| 繁体字中国語 | `zh-TW` |
| 日本語 | `ja` |
| 韓国語 | `ko` |
| スペイン語 | `es` |
| フランス語 | `fr` |
| ドイツ語 | `de` |
| ポルトガル語 | `pt` |
| ロシア語 | `ru` |
| イタリア語 | `it` |
| アラビア語 | `ar` |

## まとめ

これで、`aigne doc translate` コマンドを使用して、インタラクティブなプロセスまたは自動化のためのコマンドラインオプションを使用して、ドキュメントを複数の言語で利用できるようにする方法を学びました。

ドキュメントを翻訳した後の次の論理的なステップは、それらをユーザーが利用できるようにすることです。その方法については、[ドキュメントの公開](./guides-publishing-your-docs.md)ガイドを参照してください。