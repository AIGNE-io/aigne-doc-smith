# クリーンアップ

プロジェクトのリセットや機密データの削除が必要ですか？このガイドでは、`aigne doc clear` コマンドを使用して、生成されたファイル、設定、キャッシュ情報を安全に削除する方法を説明します。これにより、クリーンで整理されたワークスペースを維持できます。

`clear` コマンドには、ガイド付きクリーンアップのための対話型ウィザードと、迅速で特定のアクションを実行するための非対話型モードの2つのモードがあります。

## コマンドの使用方法

クリーンアッププロセスを開始するには、プロジェクトのルートディレクトリで次のコマンドを実行します。

```sh aigne doc clear icon=lucide:trash-2
aigne doc clear
```

引数なしでコマンドを実行すると、対話型ウィザードが起動し、削除したい項目を選択するよう求められます。

より高速な非対話型クリーンアップを行うには、`--targets` フラグを使用して1つ以上のターゲットを直接指定できます。

```sh aigne doc clear --targets generatedDocs icon=lucide:trash-2
aigne doc clear --targets <target1> <target2>
```

## クリーンアップオプション

対話型ウィザードでは、削除可能な項目のチェックリストが表示されます。以下の表は、利用可能な各オプションの詳細を示しており、これらは非対話型モードでターゲットとしても使用できます。

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | 出力ディレクトリ（例：`./docs`）から特定の生成されたドキュメントを選択して削除できます。ドキュメント全体の構造は維持されます。 |
| **`documentStructure`** | 生成されたすべてのドキュメントファイルと構造計画ファイル（例：`.aigne/doc-smith/output/structure-plan.json`）を削除します。 |
| **`documentConfig`** | メインのプロジェクト設定ファイル（例：`.aigne/doc-smith/config.yaml`）を削除します。削除後、新しいファイルを作成するために `aigne doc init` を実行する必要があります。 |
| **`authTokens`** | 公開に使用される保存済みの認証情報（例：`~/.aigne/doc-smith-connected.yaml` から）を削除します。どのサイトの認証をクリアするかを選択するよう求められます。 |
| **`deploymentConfig`** | プロジェクトの設定ファイルから `appUrl` キーのみを削除し、他のすべての設定はそのまま残します。 |
| **`mediaDescription`** | プロジェクトのメディアファイル用にAIが生成した説明のキャッシュ（例：`.aigne/doc-smith/media-description.yaml`）を削除します。これらは次回必要になったときに自動的に再生成されます。 |

## 例

### 対話型クリーンアップ

ガイド付きの操作を行いたい場合は、引数なしでコマンドを実行してください。チェックリストが表示されます。矢印キーで移動し、スペースバーで項目を選択または選択解除し、Enterキーで選択を確定してクリーンアップを続行します。

```sh aigne doc clear icon=lucide:mouse-pointer-click
aigne doc clear
```

### 非対話型クリーンアップ

プロンプトなしで特定の項目をクリアするには、`--targets` フラグに続けて削除したいターゲットの名前を指定します。

#### 生成されたドキュメントのみをクリアする

このコマンドは、生成されたドキュメントファイルを削除しますが、`structure-plan.json` ファイルは保持するため、後でコンテンツを再生成できます。

```sh aigne doc clear --targets generatedDocs icon=lucide:file-minus
aigne doc clear --targets generatedDocs
```

#### 構造と設定をクリアする

このコマンドは、生成されたすべてのドキュメント、構造計画、およびメインの設定ファイルを削除することで、より徹底的なクリーンアップを実行します。

```sh aigne doc clear --targets documentStructure documentConfig icon=lucide:files
aigne doc clear --targets documentStructure documentConfig
```

## まとめ

`clear` コマンドは、プロジェクトで生成されたアセットと設定を管理するための簡単な方法を提供します。安全なガイド付きプロセスには対話型モードを使用し、自動化されたワークフローにはターゲットを直接指定してください。これらの操作はファイルを永久に削除するため、続行する前に重要なデータをバックアップすることをお勧めします。