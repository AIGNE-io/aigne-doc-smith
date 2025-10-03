# 言語サポート

AIGNE DocSmithはAIを使用して、12言語への自動ドキュメント翻訳を提供します。この機能により、`aigne doc translate`コマンドを使用して、グローバルな読者向けのドキュメントを生成および維持できます。

翻訳ワークフローは、ソースドキュメントをAIエンジンで処理し、選択したターゲット言語のローカライズ版を生成します。

```d2
direction: down

Developer: {
  label: "開発者"
  shape: c4-person
}

Source-Documents: {
  label: "ソースドキュメント\n(主要言語)"
  shape: rectangle
}

AIGNE-CLI: {
  label: "`aigne doc translate`"
  shape: rectangle
}

AI-Engine: {
  label: "AI翻訳エンジン"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Translated-Documents: {
  label: "翻訳済みドキュメント\n(ターゲット言語)"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. コマンドを実行"
AIGNE-CLI -> Source-Documents: "2. コンテンツを読み取り"
AIGNE-CLI -> AI-Engine: "3. 翻訳のために送信"
AI-Engine -> AIGNE-CLI: "4. 翻訳を返す"
AIGNE-CLI -> Translated-Documents: "5. ローカライズされたファイルを書き込み"
```

## 対応言語

DocSmithは、以下の言語に対してAIを活用した翻訳を提供します。`aigne doc init`による初期設定時にプロジェクトの主要言語を定義し、翻訳対象となるターゲット言語をいくつでも選択できます。

| 言語 | 言語コード | サンプルテキスト |
|---|---|---|
| English | `en` | こんにちは |
| 简体中文 | `zh` | こんにちは |
| 繁體中文 | `zh-TW` | こんにちは |
| 日本語 | `ja` | こんにちは |
| 한국어 | `ko` | こんにちは |
| Español | `es` | こんにちは |
| Français | `fr` | こんにちは |
| Deutsch | `de` | こんにちは |
| Português | `pt` | こんにちは |
| Русский | `ru` | こんにちは |
| Italiano | `it` | こんにちは |
| العربية | `ar` | こんにちは |

## 翻訳の設定と使用方法

翻訳言語は、プロジェクトの初期化時に設定します。`aigne doc translate`コマンドを使用すれば、いつでも新しい言語を追加したり、ドキュメントを翻訳したりできます。このコマンドは2つの操作モードをサポートしています。

### ガイド付き翻訳のための対話モード

ステップバイステップのガイド付き体験を利用するには、引数なしでコマンドを実行します。これはほとんどのユーザーに推奨されるアプローチです。

```bash 対話型翻訳 icon=lucide:wand
aigne doc translate
```

対話モードでは、一連のプロンプトが表示され、以下の操作が可能です：

1.  リストから翻訳する既存のドキュメントを選択します。
2.  対応言語リストから1つ以上のターゲット言語を選択します。
3.  プロジェクトの設定にまだ含まれていない新しい翻訳言語を追加します。

### 自動化のためのコマンドライン引数

直接制御したり、自動化スクリプトで使用したりするために、ドキュメントと言語をコマンドライン引数として指定できます。この方法は、開発者やCI/CDパイプラインへの統合に最適です。

```bash コマンド例 icon=lucide:terminal
# overview.mdとexamples.mdを中国語と日本語に翻訳
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

`translate`コマンドの主要なパラメータは次のとおりです：

| パラメータ | 説明 |
|---|---|
| `--langs` | ターゲット言語の言語コードを指定します。このフラグは複数回使用して、複数の言語を選択できます。 |
| `--docs` | 翻訳するドキュメントへのパスを指定します（例：`overview.md`）。これも複数回使用できます。 |
| `--feedback` | 翻訳モデルをガイドするための具体的な指示を提供します（例：`"フォーマルなトーンを使用"`）。 |
| `--glossary` | カスタム用語集ファイル（例：`@path/to/glossary.md`）を使用して、プロジェクト固有の用語の翻訳の一貫性を確保します。 |

---

このセクションでは、利用可能な言語とそれらを有効にする方法について説明しました。翻訳ワークフローの完全なガイドについては、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドを参照してください。