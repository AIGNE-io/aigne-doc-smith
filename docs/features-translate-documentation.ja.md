# ドキュメントの翻訳

AIGNE DocSmithは、ドキュメントを英語、中国語、スペイン語など12の異なる言語に翻訳でき、プロジェクトを世界中のオーディエンスに届けることができます。このツールは、翻訳を管理するために2つの方法を提供します。ガイド付きセットアップのためのインタラクティブモードと、正確な制御と自動化のためのコマンドライン引数です。

## インタラクティブな翻訳

ガイド付きの体験をしたい場合は、引数なしで `translate` コマンドを実行してください。この方法は、ステップバイステップのプロセスを好むユーザーに最適です。

```bash
aigne doc translate
```

このコマンドは、プロセスを案内するインタラクティブなウィザードを起動します。

1.  **翻訳するドキュメントの選択:** 既存のドキュメントのリストが表示されます。スペースバーを使って翻訳したいものを選択します。

    ![翻訳するドキュメントを選択](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **ターゲット言語の選択:** ドキュメントを選択した後、サポートされているオプションのリストから1つ以上のターゲット言語を選びます。

    ![翻訳先の言語を選択](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **確認と実行:** DocSmithは翻訳を処理し、選択した各ファイルについて、選択した各言語の新しいバージョンを生成します。

## コマンドラインによる翻訳

スクリプトやCI/CDパイプラインでの自動化には、コマンドラインフラグを使用して翻訳プロセスを制御します。この方法は、開発者や上級ユーザーに高い柔軟性を提供します。

### コマンドパラメータ

<x-field-group>
  <x-field data-name="--langs" data-type="string" data-required="false" data-desc="ターゲット言語を1つ指定します。このフラグは複数回使用して、複数の言語を含めることができます（例：--langs zh --langs ja）。"></x-field>
  <x-field data-name="--docs" data-type="string" data-required="false" data-desc="翻訳するドキュメントのパスを指定します。これもバッチ翻訳のために複数回使用できます。"></x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false" data-desc="翻訳の品質をガイドするためにAIに提案を提供します（例：--feedback &quot;フォーマルなトーンを使用してください&quot;）。"></x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false" data-desc="特定の用語について一貫した用語を保証するために、Markdown形式の用語集ファイルを使用します（例：--glossary @path/to/glossary.md）。"></x-field>
  <x-field data-name="--model" data-type="string" data-required="false" data-desc="使用する翻訳モデルを指定します。例：'openai:gpt-4o' または 'anthropic:claude-sonnet-4-5'。"></x-field>
</x-field-group>

### 例

#### 特定のドキュメントの翻訳

`overview.md` と `examples.md` を中国語と日本語に翻訳するには、次のコマンドを実行します。

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### 用語集とフィードバックの使用

ブランド名や技術用語が正しく翻訳されるように、用語集ファイルを提供できます。また、翻訳スタイルを洗練させるためにフィードバックを提供することもできます。

```bash
aigne doc translate --glossary @path/to/glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

#### 翻訳モデルの指定

翻訳タスクに特定のAIモデルを使用するには、`--model` フラグを使用します。

```bash
aigne doc translate --docs overview.md --langs fr --model openai:gpt-4o
```

## サポートされている言語

DocSmithは、以下の12言語の自動翻訳をサポートしています。

| 言語             | コード    |
| -------------------- | ------- |
| 英語              | `en`    |
| 簡体字中国語   | `zh-CN` |
| 繁体字中国語  | `zh-TW` |
| 日本語             | `ja`    |
| 韓国語               | `ko`    |
| スペイン語              | `es`    |
| フランス語               | `fr`    |
| ドイツ語              | `de`    |
| ポルトガル語           | `pt-BR` |
| ロシア語              | `ru`    |
| イタリア語              | `it`    |
| アラビア語               | `ar`    |

---

ドキュメントが翻訳されたら、世界に向けて共有する準備が整います。

<x-card data-title="次へ：ドキュメントの公開" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="続きを読む">
  ドキュメントを公開プラットフォームや独自のプライベートウェブサイトに公開する方法についてのガイドです。
</x-card>