# 言語サポート

AIGNE DocSmithは、12言語へのドキュメントの自動翻訳を提供し、グローバルな読者向けのローカライズされたコンテンツの生成と維持を可能にします。この機能は主に `aigne doc translate` コマンドを通じて管理されます。

翻訳ワークフローは、AIエンジンを使用してソースドキュメントを処理し、選択したターゲット言語でバージョンを生成します。`aigne doc translate` コマンドは、翻訳するドキュメントと言語を選択するためのインタラクティブなインターフェースを提供します。

![インタラクティブなドキュメント翻訳フロー](../assets/screenshots/doc-translate.png)

## サポートされている言語

DocSmithは、以下の言語に対するAIによる翻訳をサポートしています。プロジェクトの主要言語は `aigne doc init` による初期設定時に定義でき、以下の言語からいくつでも翻訳対象として選択できます。

| Language | Language Code |
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

## 翻訳の設定と使用方法

言語設定は、プロジェクトを初期化する際に設定します。`aigne doc translate` コマンドを使用して、いつでも新しい言語を追加したり、既存のドキュメントを翻訳したりできます。このコマンドは2つの操作モードをサポートしています。

### ガイド付き翻訳のためのインタラクティブモード

ステップバイステップのガイド付きプロセスについては、引数なしでコマンドを実行してください。この方法はほとんどのユーザーに推奨されます。

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

インタラクティブモードでは、一連のプロンプトが表示され、翻訳するドキュメントを選択し、リストからターゲット言語を選ぶことができます。このモードでは、プロジェクトの設定にまだ含まれていない新しい翻訳言語を追加することもできます。

![翻訳対象言語の選択](../assets/screenshots/doc-translate-langs.png)

### 自動化のためのコマンドライン引数

直接制御したり、自動化スクリプトで使用したりする場合は、ドキュメントと言語をコマンドライン引数として指定できます。この方法は、CI/CDパイプラインへの統合に適しています。

```bash Command Example icon=lucide:terminal
# overview.mdとexamples.mdを中国語と日本語に翻訳する
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

以下の表は、`translate` コマンドの主要なパラメータを詳述しています。

| Parameter | Description |
|---|---|
| `--langs` | ターゲット言語の言語コードを指定します。このフラグを複数回使用して、複数の言語を選択できます。 |
| `--docs` | 翻訳するドキュメントへのパス（例：`overview.md`）を指定します。このフラグも複数回使用できます。 |
| `--feedback` | 翻訳モデルをガイドするための特定の指示を提供します（例：`"Use a formal tone"`）。 |
| `--glossary` | カスタム用語集ファイル（例：`@path/to/glossary.md`）を使用して、プロジェクト固有の用語の一貫した翻訳を保証します。 |

---

このセクションでは、利用可能な言語とその有効化方法の概要を説明しました。翻訳ワークフローに関する完全なガイドについては、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドを参照してください。