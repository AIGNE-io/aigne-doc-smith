# クリーンアップ

このガイドでは、`aigne doc clear` コマンドを使用して、プロジェクトから生成されたファイル、設定、キャッシュデータを削除する方法について説明します。このコマンドは、最初からやり直したり、機密情報を削除したりする場合に便利です。

`clear` コマンドは、対話モードと非対話モードの2つのモードで実行できます。引数なしで実行すると、利用可能なクリーンアップオプションを案内する対話型のウィザードが起動します。

```d2
direction: down

User: {
  shape: c4-person
}

Command-Execution: {
  label: "コマンド実行"
  shape: rectangle

  CLI: {
    label: "`aigne doc clear [targets]`"
  }

  Decision: {
    label: "引数が\n指定されているか？"
    shape: diamond
  }

  Interactive-Wizard: {
    label: "対話型ウィザード\n（ターゲットのチェックリスト）"
  }
}

Cleanup-Targets: {
  label: "クリーンアップターゲット"
  shape: rectangle
  grid-columns: 3

  generatedDocs: {}
  documentStructure: {}
  documentConfig: {}
  authTokens: {}
  deploymentConfig: {}
  mediaDescription: {}
}

Project-Artifacts: {
  label: "プロジェクトアーティファクト"
  shape: rectangle
  grid-columns: 3

  docs: {
    label: "./docs"
  }
  structure-plan: {
    label: "structure-plan.json"
  }
  config-yaml: {
    label: "config.yaml"
  }
  auth-config: {
    label: "~/.aigne/doc-smith-connected.yaml"
  }
  media-cache: {
    label: "メディア記述\nキャッシュ"
  }
}

User -> Command-Execution.CLI

Command-Execution.CLI -> Command-Execution.Decision

Command-Execution.Decision -> Command-Execution.Interactive-Wizard: "いいえ"
Command-Execution.Decision -> Cleanup-Targets: "はい"

Command-Execution.Interactive-Wizard -> Cleanup-Targets: "ユーザーが選択"

Cleanup-Targets.generatedDocs -> Project-Artifacts.docs: "削除"
Cleanup-Targets.documentStructure -> Project-Artifacts.docs: "削除"
Cleanup-Targets.documentStructure -> Project-Artifacts.structure-plan: "削除"
Cleanup-Targets.documentConfig -> Project-Artifacts.config-yaml: "削除"
Cleanup-Targets.authTokens -> Project-Artifacts.auth-config: "削除"
Cleanup-Targets.deploymentConfig -> Project-Artifacts.config-yaml: "appUrl を削除"
Cleanup-Targets.mediaDescription -> Project-Artifacts.media-cache: "削除"
```

## コマンドの使用方法

クリーンアップコマンドを使用するには、ターミナルで以下を実行します。

```bash
aigne doc clear
```

または、1つ以上のターゲットを引数として直接指定して、非対話的にコマンドを実行することもできます。

```bash
aigne doc clear --targets <target1> <target2> ...
```

## クリーンアップオプション

`aigne doc clear` コマンドを引数なしで実行すると、削除する項目の対話型チェックリストが表示されます。一度に複数の項目を選択してクリアできます。

利用可能なクリーンアップターゲットの詳細は以下の通りです。

| Target | 説明 |
| :--- | :--- |
| **`generatedDocs`** | 出力ディレクトリ（例：`./docs`）から生成されたすべてのドキュメントファイルを削除します。この操作では、ドキュメント構造ファイルは保持されます。 |
| **`documentStructure`** | 生成されたすべてのドキュメントとドキュメント構造ファイル（例：`.aigne/doc-smith/output/structure-plan.json`）を削除します。 |
| **`documentConfig`** | メインのプロジェクト設定ファイル（例：`.aigne/doc-smith/config.yaml`）を削除します。再生成するには `aigne doc init` を実行する必要があります。 |
| **`authTokens`** | ファイル（例：`~/.aigne/doc-smith-connected.yaml`）から保存された認証トークンを削除します。どのサイトの認証をクリアするかを選択するよう求められます。 |
| **`deploymentConfig`** | ドキュメント設定ファイルから `appUrl` を削除し、他の設定はそのまま残します。 |
| **`mediaDescription`** | メディアファイル用にキャッシュされたAI生成の記述（例：`.aigne/doc-smith/media-description.yaml` から）を削除します。これらは次回の実行時に再生成されます。 |

## 例

### 対話型クリーンアップ

対話型のクリーンアッププロセスを開始するには、引数なしでコマンドを実行します。これにより、スペースバーで削除したい項目を選択し、Enterで確定できるチェックリストが表示されます。

```bash
aigne doc clear
```

### 非対話型クリーンアップ

特定の項目を直接クリアするには、そのターゲット名を引数として指定します。

#### 生成されたドキュメントのみをクリア

このコマンドは `docs` ディレクトリを削除しますが、`structure-plan.json` はそのまま残します。

```bash
aigne doc clear --targets generatedDocs
```

#### 構造と設定をクリア

このコマンドは、生成されたドキュメント、構造プラン、および設定ファイルを削除します。

```bash
aigne doc clear --targets documentStructure documentConfig
```

## まとめ

`clear` コマンドは、プロジェクトの状態を管理するためのツールです。ガイド付きのプロセスには対話モードを使用し、より迅速な実行のためにはターゲットを直接指定してください。これらの操作は不可逆であるため、クリーンアップを実行する前に重要なデータがバックアップされていることを確認してください。