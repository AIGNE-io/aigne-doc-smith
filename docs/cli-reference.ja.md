# CLIコマンドリファレンス

このガイドでは、利用可能なすべての `aigne doc` サブコマンド、その引数、およびオプションのリファレンスを提供します。コマンドラインインターフェースを最大限に活用したいユーザーを対象としています。

一般的な構文は次のとおりです。

```bash
aigne doc <command> [options]
```

### コマンドのワークフロー

以下の図は、DocSmithのCLIコマンドを使用してドキュメントを作成および保守する典型的なライフサイクルを示しています。

```d2
direction: down

Start: {
  label: "プロジェクトのセットアップ"
  shape: circle
}

init: {
  label: "aigne doc init\n(対話式セットアップ)"
  shape: rectangle
}

generate: {
  label: "aigne doc generate\n(全ドキュメントの作成/更新)"
  shape: rectangle
}

refinement-cycle: {
  label: "改良サイクル"
  shape: rectangle
  grid-columns: 2

  update: {
    label: "aigne doc update\n(単一ドキュメントの改良)"
  }
  translate: {
    label: "aigne doc translate\n(コンテンツのローカライズ)"
  }
}

publish: {
  label: "aigne doc publish\n(ドキュメントのデプロイ)"
  shape: rectangle
}

End: {
  label: "ドキュメント公開"
  shape: circle
  style.fill: "#a2eeaf"
}

Start -> init: "任意" {
  style.stroke-dash: 4
}
init -> generate: "設定"
Start -> generate: "直接"
generate -> refinement-cycle: "改良"
refinement-cycle -> publish: "準備完了"
generate -> publish: "直接デプロイ"
publish -> End
```

---

## `aigne doc generate`

ソースコードを分析し、設定に基づいてドキュメント一式を生成します。設定が見つからない場合は、対話式のセットアップウィザードが自動的に起動します。

### オプション

| オプション          | タイプ  | 説明                                                                                          |
| ------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `--feedback`        | string  | ドキュメント全体の構造を調整および改良するためのフィードバックを提供します。                    |
| `--forceRegenerate` | boolean | 既存のコンテンツを破棄し、すべてのドキュメントを最初から再生成します。                        |
| `--model`           | string  | 生成に使用する特定の言語モデルを指定します（例：`openai:gpt-4o`）。デフォルトを上書きします。 |

### 使用例

**ドキュメントを生成または更新する：**

```bash
aigne doc generate
```

**すべてのドキュメントを強制的に再生成する：**

```bash
aigne doc generate --forceRegenerate
```

**フィードバックをもとにドキュメント構造を改良する：**

```bash
aigne doc generate --feedback "APIの例のセクションを新しく追加し、「概要」ページを削除してください。"
```

**AIGNE Hubの特定のモデルを使用して生成する：**

```bash
aigne doc generate --model google:gemini-1.5-flash
```

---

## `aigne doc update`

特定のドキュメントを最適化し、再生成します。対話形式で実行してドキュメントを選択するか、オプションで直接指定することができます。これは、プロジェクト全体を再生成することなく、フィードバックに基づいて対象を絞った改善を行うのに役立ちます。

### オプション

| オプション   | タイプ  | 説明                                                                                |
| ---------- | ----- | ----------------------------------------------------------------------------------- |
| `--docs`     | array | 再生成するドキュメントのパスのリスト。複数回使用できます。                          |
| `--feedback` | string | 選択したドキュメントのコンテンツを改善するための具体的なフィードバックを提供します。|

### 使用例

**更新するドキュメントを選択するための対話セッションを開始する：**

```bash
aigne doc update
```

**特定のドキュメントを対象を絞ったフィードバックで更新する：**

```bash
aigne doc update --docs overview.md --feedback "より詳細なFAQ項目を追加してください"
```

---

## `aigne doc translate`

既存のドキュメントを1つ以上の言語に翻訳します。対話形式で実行してドキュメントと言語を選択するか、引数として指定して非対話形式で実行することができます。

### オプション

| オプション     | タイプ  | 説明                                                                                             |
| ------------ | ----- | ------------------------------------------------------------------------------------------------ |
| `--docs`       | array | 翻訳するドキュメントのパスのリスト。複数回使用できます。                                         |
| `--langs`      | array | ターゲット言語コードのリスト（例：`zh`、`ja`）。複数回使用できます。                               |
| `--feedback`   | string | 翻訳の品質を向上させるためのフィードバックを提供します。                                           |
| `--glossary`   | string | 言語間で一貫した用語を確保するための用語集ファイルへのパス。`@path/to/glossary.md` を使用します。 |

### 使用例

**対話型の翻訳セッションを開始する：**

```bash
aigne doc translate
```

**特定のドキュメントを中国語と日本語に翻訳する：**

```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

**用語集とフィードバックを使用して、より高品質な翻訳を行う：**

```bash
aigne doc translate --glossary @glossary.md --feedback "専門用語を一貫して使用してください"
```

---

## `aigne doc publish`

生成されたドキュメントをDiscuss Kitプラットフォームに公開します。公式のAIGNE DocSmithプラットフォーム、または自己ホスト型のインスタンスに公開できます。

### オプション

| オプション   | タイプ  | 説明                                                                                         |
| ---------- | ------ | -------------------------------------------------------------------------------------------- |
| `--appUrl` | string | 自己ホスト型のDiscuss KitインスタンスのURL。指定しない場合、コマンドは対話形式で実行されます。 |

### 使用例

**対話型の公開セッションを開始する：**

```bash
aigne doc publish
```

**自己ホスト型のインスタンスに直接公開する：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc init`

対話式の構成ウィザードを手動で開始します。これは、新しいプロジェクトを設定したり、既存のプロジェクトの構成を変更したりするのに役立ちます。ウィザードは、ソースコードのパスの定義、出力ディレクトリの設定、言語の選択、ドキュメントのスタイルと対象読者の定義を案内します。

### 使用例

**セットアップウィザードを起動する：**

```bash
aigne doc init
```

DocSmithをニーズに合わせて調整する方法の詳細については、[設定ガイド](./configuration.md)を参照してください。