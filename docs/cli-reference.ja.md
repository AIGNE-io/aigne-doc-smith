# CLIコマンドリファレンス

このガイドは、利用可能なすべての`aigne doc`サブコマンド、その引数、およびオプションに関する包括的なリファレンスを提供します。コマンドラインインターフェースを最大限に活用したいユーザーを対象としています。

一般的な構文は次のとおりです。

```bash command
aigne doc <command> [options]
```

### コマンドのワークフロー

以下の図は、DocSmithのCLIコマンドを使用してドキュメントを作成および維持するための典型的なライフサイクルと、それらが相互作用するデータを示しています。

```d2
direction: down

# Artifacts
Source-Code: {
  label: "ソースコード"
  shape: cylinder
}
Configuration: {
  label: "設定\n(.aigne/doc-smith/config.yml)"
  shape: cylinder
}
Generated-Docs: {
  label: "生成されたドキュメント"
  shape: cylinder
}
Published-Docs: {
  label: "公開されたサイト"
  shape: cylinder
}

# --- Core Workflow ---
Lifecycle: {
  label: "ドキュメンテーションライフサイクル"
  
  init: {
    label: "1. 初期化\n`aigne doc init`"
    shape: rectangle
  }

  generate: {
    label: "2. 生成\n`aigne doc generate`"
    shape: rectangle
  }

  Refinement: {
    label: "3. 改良（反復）"
    grid-columns: 2

    update: {
      label: "更新\n`aigne doc update`"
      shape: rectangle
    }
    translate: {
      label: "翻訳\n`aigne doc translate`"
      shape: rectangle
    }
  }

  publish: {
    label: "4. 公開\n`aigne doc publish`"
    shape: rectangle
  }
}

# --- Utility Commands ---
Utilities: {
  label: "ユーティリティコマンド"
  grid-columns: 2
  
  prefs: {
    label: "設定の表示\n`aigne doc prefs`"
    shape: rectangle
  }
  clear: {
    label: "データのクリア\n`aigne doc clear`"
    shape: rectangle
  }
}


# --- Connections ---

# Setup and Generation
Lifecycle.init -> Configuration: "作成"
Source-Code -> Lifecycle.generate: "読み取り"
Configuration -> Lifecycle.generate: "読み取り"
Lifecycle.generate -> Generated-Docs: "作成 / 上書き"
Lifecycle.generate -> Lifecycle.init: {
  label: "設定がない場合に実行"
  style.stroke-dash: 4
}

# Refinement Loop
Generated-Docs <-> Lifecycle.Refinement: "読み取りと書き込み"

# Publishing
Lifecycle.Refinement -> Lifecycle.publish
Lifecycle.publish -> Published-Docs: "アップロード先"

# Utility Connections
Utilities.prefs -> Configuration: "読み取り"
Utilities.clear -> Configuration: "削除"
Utilities.clear -> Generated-Docs: "削除"
```

---

## `aigne doc init`

対話式の設​​定ウィザードを手動で開始します。これは、新しいプロジェクトをセットアップしたり、既存のプロジェクトの設定を変更したりするのに役立ちます。ウィザードは、ソースコードのパスの定義、出力ディレクトリの設定、言語の選択、ドキュメントのスタイルと対象読者の定義をガイドします。

### 使用例

**セットアップウィザードを起動します：**

```bash
aigne doc init
```

DocSmithをニーズに合わせて調整する方法の詳細については、[設定ガイド](./configuration.md)を参照してください。

---

## `aigne doc generate`

ソースコードを分析し、設定に基づいて完全なドキュメントセットを生成します。設定が見つからない場合は、対話式のセットアップウィザード（`aigne doc init`）が自動的に起動します。

### オプション

| Option              | Type    | Description                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--forceRegenerate` | boolean | 既存のコンテンツを破棄し、すべてのドキュメントを最初から再生成します。                                     |
| `--feedback`        | string  | ドキュメント全体の構造を調整および改良するためのフィードバックを提供します。                                   |
| `--model`           | string  | 生成に使用する特定のLLM（大規模言語モデル）を指定します（例：`anthropic:claude-3-5-sonnet`）。デフォルトを上書きします。 | 

### 使用例

**ドキュメントを生成または更新します：**

```bash
aigne doc generate
```

**すべてのドキュメントの完全な再生成を強制します：**

```bash
aigne doc generate --forceRegenerate
```

**フィードバックを用いてドキュメント構造を改良します：**

```bash
aigne doc generate --feedback "Add a new section for API examples and remove the 'About' page."
```

**特定のモデルを使用して生成します：**

```bash
aigne doc generate --model openai:gpt-4o
```

---

## `aigne doc update`

特定のドキュメントを最適化し、再生成します。対話的に実行してドキュメントを選択するか、オプションで直接指定できます。これは、プロジェクト全体を再生成することなく、フィードバックに基づいて対象を絞った改善を行うのに役立ちます。

### オプション

| Option     | Type  | Description                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | 再生成するドキュメントパスのリスト。複数回指定できます。                         |
| `--feedback` | string | 選択したドキュメントのコンテンツを改善するための具体的なフィードバックを提供します。              |

### 使用例

**対話セッションを開始して更新するドキュメントを選択します：**

```bash
aigne doc update
```

**対象を絞ったフィードバックで特定のドキュメントを更新します：**

```bash
aigne doc update --docs /overview.md --feedback "Add more detailed FAQ entries"
```

---

## `aigne doc translate`

既存のドキュメントを1つ以上の言語に翻訳します。対話的に実行してドキュメントと言語を選択するか、引数として指定して非対話的に実行できます。

### オプション

| Option       | Type  | Description                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | 翻訳するドキュメントパスのリスト。複数回指定できます。                                         |
| `--langs`      | array | ターゲット言語コードのリスト（例：`zh-CN`、`ja`）。複数回指定できます。                            |
| `--feedback`   | string | 翻訳の品質を向上させるためのフィードバックを提供します。                                               |
| `--glossary`   | string | 言語間で一貫した用語を確保するための用語集ファイルへのパス。`@path/to/glossary.md`を使用します。 |

### 使用例

**対話型の翻訳セッションを開始します：**

```bash
aigne doc translate
```

**特定のドキュメントを中国語と日本語に翻訳します：**

```bash
aigne doc translate --langs zh-CN --langs ja --docs /features/generate-documentation.md --docs /overview.md
```

**用語集とフィードバックを使用して、品質を向上させた翻訳を行います：**

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

## `aigne doc publish`

ドキュメントを公開し、共有可能なリンクを生成します。このコマンドは、コンテンツをDiscuss Kitインスタンスにアップロードします。公式のAIGNE DocSmithプラットフォームを使用するか、独自の[Discuss Kit](https://www.web3kit.rocks/discuss-kit)インスタンスを実行できます。

### オプション

| Option     | Type   | Description                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | セルフホストのDiscuss KitインスタンスのURL。指定しない場合、コマンドは対話的に実行されます。 |

### 使用例

**対話型の公開セッションを開始します：**

```bash
aigne doc publish
```

**セルフホストのインスタンスに直接公開します：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc prefs`

ユーザー設定とフィードバック駆動のルールを管理します。時間が経つにつれて、DocSmithはフィードバックから学習し、永続的な設定を作成します。このコマンドを使用すると、これらの学習済みルールを表示、切り替え、または削除できます。

### オプション

| Option | Type | Description |
| --- | --- | --- |
| `--list` | boolean | 保存されているすべての設定を一覧表示します。 |
| `--remove` | boolean | 対話的にプロンプトを表示し、1つ以上の設定を選択して削除します。 |
| `--toggle` | boolean | 対話的にプロンプトを表示し、設定のアクティブ状態を選択して切り替えます。 |
| `--id` | string | 直接削除または切り替えるための設定IDを指定します。 |

### 使用例

**保存されているすべての設定を一覧表示します：**

```bash
aigne doc prefs --list
```

**対話型の削除モードを開始します：**

```bash
aigne doc prefs --remove
```

**IDで特定の設定を切り替えます：**

```bash
aigne doc prefs --toggle --id "pref_12345"
```

---

## `aigne doc clear`

ローカルに保存されたデータをクリアするための対話セッションを起動します。これを使用して、生成されたドキュメント、ドキュメント構造の設定、またはキャッシュされた認証トークンを削除できます。

### 使用例

**対話型のクリーンアッププロセスを開始します：**

```bash
aigne doc clear
```