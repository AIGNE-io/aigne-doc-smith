# ドキュメントの翻訳

AIGNE DocSmithは、ドキュメントを12の異なる言語に翻訳でき、プロジェクトを世界中のオーディエンスに届けることができます。このツールは翻訳を管理するための2つの方法を提供します。ガイド付きセットアップのためのインタラクティブモードと、正確な制御と自動化のためのコマンドライン引数です。

## インタラクティブな翻訳

ガイド付きの体験には、引数なしで`translate`コマンドを実行します。これは、ステップバイステップのプロセスを好むユーザーに最適です。

```bash
aigne doc translate
```

このコマンドは、プロセスを案内するインタラクティブなウィザードを起動します。

1.  **翻訳するドキュメントを選択：**既存のドキュメントのリストが表示されます。スペースバーを使用して、翻訳したいものを選択します。

    ![翻訳するドキュメントを選択](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **ターゲット言語を選択：**ドキュメントを選択した後、サポートされているオプションのリストから1つ以上のターゲット言語を選びます。

    ![翻訳する言語を選択](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **確認と実行：**DocSmithは翻訳を処理し、選択した各言語に対して選択されたファイルの新しいバージョンを生成します。

## コマンドラインによる翻訳

スクリプトやCI/CDパイプラインでの自動化には、コマンドラインフラグを使用して翻訳プロセスを制御します。この方法は、開発者や上級ユーザーに適しています。

### コマンドパラメータ

<x-field data-name="--langs" data-type="string" data-required="false" data-desc="ターゲット言語を1つ指定します。このフラグを複数回使用して、複数の言語を含めることができます（例：--langs zh --langs ja）。"></x-field>
<x-field data-name="--docs" data-type="string" data-required="false" data-desc="翻訳するドキュメントのパスを指定します。これも複数回使用してバッチ翻訳が可能です。"></x-field>
<x-field data-name="--feedback" data-type="string" data-required="false" data-desc="AIに提案を提供して、翻訳の品質をガイドします（例：--feedback &quot;フォーマルなトーンを使用してください&quot;）。"></x-field>
<x-field data-name="--glossary" data-type="string" data-required="false" data-desc="Markdown形式の用語集ファイルを使用して、特定の用語の一貫性を確保します（例：--glossary @path/to/glossary.md）。"></x-field>

### 例

#### 特定のドキュメントの翻訳

`overview.md`と`examples.md`を中国語と日本語に翻訳するには、以下を実行します。

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### 用語集とフィードバックの使用

ブランド名や技術用語が正しく翻訳されるように、用語集ファイルを提供できます。また、フィードバックを与えて翻訳スタイルを洗練させることもできます。

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

## サポートされている言語

DocSmithは、以下の言語の自動翻訳をサポートしています。

| Language | Code |
|---|---|
| 英語 | en |
| 簡体字中国語 | zh-CN |
| 繁体字中国語 | zh-TW |
| 日本語 | ja |
| 韓国語 | ko |
| スペイン語 | es |
| フランス語 | fr |
| ドイツ語 | de |
| ポルトガル語 | pt-BR |
| ロシア語 | ru |
| イタリア語 | it |
| アラビア語 | ar |

---

ドキュメントが翻訳されたら、世界と共有する準備が整いました。

<x-card data-title="次へ：ドキュメントの公開" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="続きを読む">
  ドキュメントを公開プラットフォームまたは独自のプライベートウェブサイトに公開する方法についてのガイド。
</x-card>