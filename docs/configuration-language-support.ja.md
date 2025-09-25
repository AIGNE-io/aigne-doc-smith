# 言語サポート

AIGNE DocSmithはAIを使用して、12言語への自動ドキュメント翻訳を提供します。これにより、`aigne doc translate`コマンドを使用して、世界中の読者向けのドキュメントを生成および維持できます。

翻訳ワークフローは、ソースドキュメントをAIエンジンで処理し、選択したターゲット言語でローカライズされたバージョンを生成します。

```d2
direction: down

Source-Doc: {
  label: "ソースドキュメント\n(例：英語)"
  shape: rectangle
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI翻訳エンジン"
  shape: rectangle
}

Translated-Docs: {
  label: "翻訳済みドキュメント"
  shape: rectangle
  grid-columns: 3

  zh: "简体中文"
  ja: "日本語"
  es: "Español"
  fr: "Français"
  de: "Deutsch"
  more: "..."
}

Source-Doc -> AI-Engine: "`aigne doc translate`"
AI-Engine -> Translated-Docs: "生成"
```

## サポートされている言語

DocSmithは、以下の言語に対してAIによる翻訳を提供します。プロジェクトの初期設定時に主要言語を定義し、翻訳対象として任意の数のターゲット言語を選択できます。

| 言語 | 言語コード | サンプルテキスト |
|---|---|---|
| English | `en` | こんにちは |
| 简体中文 | `zh` | 你好 |
| 繁體中文 | `zh-TW` | 你好 |
| 日本語 | `ja` | こんにちは |
| 한국어 | `ko` | 안녕하세요 |
| Español | `es` | Hola |
| Français | `fr` | Bonjour |
| Deutsch | `de` | Hallo |
| Português | `pt` | Olá |
| Русский | `ru` | Привет |
| Italiano | `it` | Ciao |
| العربية | `ar` | مرحبا |

## 翻訳の設定と使用方法

翻訳言語は、`aigne doc init`でプロジェクトを初期化する際に設定されます。`aigne doc translate`コマンドを使用すれば、いつでも新しい言語を追加したり、ドキュメントを翻訳したりできます。このコマンドには2つの操作モードがあります。

### ガイド付き翻訳のためのインタラクティブモード

ステップバイステップのガイド付きエクスペリエンスを利用するには、引数なしでコマンドを実行します。これはほとんどのユーザーに推奨されるアプローチです。

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

インタラクティブモードでは、一連のプロンプトが表示され、以下の操作が可能です：

1.  既存のドキュメントのリストから翻訳するものを選択する。
2.  サポートされているリストから1つ以上のターゲット言語を選択する。
3.  プロジェクトの設定にまだ含まれていない新しい翻訳言語を追加する。

### 自動化のためのコマンドライン引数

直接的な制御や自動化スクリプトで使用するために、ドキュメントと言語をコマンドライン引数として直接指定できます。これは開発者やCI/CDパイプラインに最適です。

```bash Command Example icon=lucide:terminal
# overview.mdとexamples.mdを中国語と日本語に翻訳
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

このコマンドの主要なパラメータは次のとおりです：

| パラメータ | 説明 |
|---|---|
| `--langs` | ターゲット言語の言語コードを指定します。このフラグは複数回使用して、いくつかの言語を選択できます。 |
| `--docs` | 翻訳するドキュメントへのパスを指定します（例：`overview.md`）。これも複数回使用できます。 |
| `--feedback` | 翻訳モデルをガイドするための具体的な指示を提供します（例：`"フォーマルなトーンを使用する"`）。 |
| `--glossary` | カスタム用語集ファイル（例：`@path/to/glossary.md`）を使用して、プロジェクト固有の用語の一貫した翻訳を保証します。 |

---

このセクションでは、利用可能な言語とその有効化方法について説明しました。翻訳ワークフローに関する完全なガイドについては、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドを参照してください。