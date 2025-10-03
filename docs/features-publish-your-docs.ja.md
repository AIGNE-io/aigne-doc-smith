# ドキュメントを公開する

ドキュメントを生成した後、`aigne doc publish`コマンドはファイルをアップロードし、共有可能なリンクを介してアクセスできるようにします。このガイドでは、公式のAIGNEプラットフォームまたはセルフホストインスタンスにドキュメントを公開するためのステップバイステップのプロセスを提供します。

## 公開プロセス

`aigne doc publish`コマンドは対話型ワークフローを開始します。初めてデスティネーションに公開する場合、CLIはブラウザを開き、1回限りの認証プロセスをガイドします。その後の公開では、`~/.aigne/doc-smith-connected.yaml`に保存された認証情報が使用されます。

```d2 公開ワークフロー icon=lucide:upload-cloud
shape: sequence_diagram

User: {
  label: "開発者 / CI-CD"
  shape: c4-person
}

CLI: {
  label: "CLI\n(aigne doc publish)"
}

Local-Config: {
  label: "ローカル設定\n(~/.aigne/...)"
  shape: cylinder
}

Browser

Platform: {
  label: "プラットフォーム\n(公式またはセルフホスト)"
}

User -> CLI: "コマンドを実行"

alt "対話モード" {
  CLI -> Local-Config: "認証情報を確認"
  opt "認証情報が見つからない (初回)" {
    CLI -> User: "プラットフォームの選択を促す"
    User -> CLI: "プラットフォームを選択"
    CLI -> Browser: "認証URLを開く"
    User -> Browser: "ログインと承認"
    Browser -> Platform: "トークンを要求"
    Platform -> Browser: "トークンを返す"
    Browser -> CLI: "トークンをCLIに送信"
    CLI -> Local-Config: "認証情報を保存"
  }
  CLI -> Platform: "ドキュメントをアップロード"
  Platform -> CLI: "成功を確認"
  CLI -> User: "成功メッセージを表示"
}

alt "CI/CDモード" {
  note over CLI: "ENV VARからトークンを読み込む"
  CLI -> Platform: "ドキュメントをアップロード"
  Platform -> CLI: "成功を確認"
  CLI -> User: "成功ステータスを返す"
}
```

## 公開オプション

ドキュメントをホストするために、2つの主要なデスティネーションから選択できます。

<x-cards data-columns="2">
  <x-card data-title="公式プラットフォーム" data-icon="lucide:globe">
    AIGNEが運営するサービスであるdocsmith.aigne.ioに公開します。これは、オープンソースプロジェクトやドキュメントを迅速に公開共有するための簡単なオプションです。
  </x-card>
  <x-card data-title="セルフホストインスタンス" data-icon="lucide:server">
    ブランディング、アクセス、データプライバシーを完全に制御するために、独自のDiscuss Kitインスタンスに公開します。これは、内部またはプライベートなドキュメントに推奨されるオプションです。公式ドキュメントにある指示に従って、独自のDiscuss Kitインスタンスを実行できます。
  </x-card>
</x-cards>

## ステップバイステップガイド

以下の手順に従ってドキュメントを公開してください。

### 1. 公開コマンドを実行する

プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash ターミナル icon=lucide:terminal
aigne doc publish
```

### 2. プラットフォームを選択する

初めて公開する場合、デスティネーションを選択するよう求められます。要件に合ったオプションを選択してください。

![公式プラットフォームまたはセルフホストインスタンスから選択](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d0_3cf5eb7aea85aa.png)

セルフホストインスタンスを選択した場合は、そのURLを入力するよう求められます。

### 3. アカウントを認証する

初回接続時には、ブラウザウィンドウが自動的に開き、ログインしてCLIを承認します。このステップはプラットフォームごとに1回だけ必要です。アクセストークンは将来の使用のためにローカルに保存されます。

### 4. 確認

アップロードが完了すると、ターミナルに成功メッセージが表示され、ドキュメントが公開されたことが確認されます。

```
✅ ドキュメントが正常に公開されました！
```

## CI/CD環境での公開

CI/CDパイプラインのような自動化されたワークフローで公開コマンドを使用するには、引数と環境変数を通じて必要な情報を提供することで、対話型のプロンプトをバイパスできます。

| 方法 | 名前 | 説明 |
|---|---|---|
| **引数** | `--appUrl` | Discuss KitインスタンスのURLを指定します。 |
| **環境変数** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | アクセストークンを提供して、対話型のログインプロセスをスキップします。 |

以下は、CI/CDスクリプトに適した非対話型の公開コマンドの例です。

```bash CI/CDの例 icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## トラブルシューティング

公開プロセス中に問題が発生した場合は、以下の一般的な問題のいずれかが原因である可能性があります。

- **接続エラー**: CLIが `Unable to connect to: <URL>` のようなエラーメッセージを返すことがあります。これは、ネットワークの問題、サーバーが一時的に利用できない、またはURLが正しくないことが原因である可能性があります。URLが正しく、サーバーに到達可能であることを確認してください。

- **無効なウェブサイトURL**: コマンドが `The provided URL is not a valid website on ArcBlock platform` というメッセージで失敗することがあります。デスティネーションURLはArcBlockプラットフォーム上に構築されたウェブサイトでなければなりません。ドキュメントをホストするには、独自のDiscuss Kitインスタンスを実行できます。

- **必須コンポーネントの欠落**: `This website does not have required components for publishing` というエラーは、デスティネーションのウェブサイトにDiscuss Kitコンポーネントがインストールされていないことを示します。Discuss Kitのドキュメントを参照して、サイトに必要なコンポーネントを追加してください。

コマンドとオプションの完全なリストについては、[CLIコマンドリファレンス](./cli-reference.md)を参照してください。