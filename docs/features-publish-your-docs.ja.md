# ドキュメントを公開する

ドキュメントを生成した後、`aigne doc publish` コマンドはファイルをアップロードし、共有可能なリンクを通じてアクセス可能にします。このガイドでは、公式の AIGNE プラットフォームまたは自己ホスト型のインスタンスにドキュメントを公開するためのステップバイステップのプロセスを提供します。

## 公開プロセス

`aigne doc publish` コマンドは対話型のワークフローを開始します。特定の宛先に初めて公開する場合、CLI はブラウザを開き、一度限りの認証プロセスを案内します。その後の公開では、`~/.aigne/doc-smith-connected.yaml` に保存されている認証情報が使用されます。

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
  label: "プラットフォーム\n(公式または自己ホスト型)"
}

User -> CLI: "コマンドを実行"

alt "対話モード" {
  CLI -> Local-Config: "認証情報を確認"
  opt "認証情報が見つからない (初回)" {
    CLI -> User: "プラットフォームの選択を促す"
    User -> CLI: "プラットフォームを選択"
    CLI -> Browser: "認証 URL を開く"
    User -> Browser: "ログイン & 承認"
    Browser -> Platform: "トークンを要求"
    Platform -> Browser: "トークンを返す"
    Browser -> CLI: "トークンを CLI に送信"
    CLI -> Local-Config: "認証情報を保存"
  }
  CLI -> Platform: "ドキュメントをアップロード"
  Platform -> CLI: "成功を確認"
  CLI -> User: "成功メッセージを表示"
}

alt "CI/CD モード" {
  note over CLI: "ENV VAR からトークンを読み取る"
  CLI -> Platform: "ドキュメントをアップロード"
  Platform -> CLI: "成功を確認"
  CLI -> User: "成功ステータスを返す"
}
```

## 公開オプション

ドキュメントをホストするために、2つの主要な宛先から選択できます。

<x-cards data-columns="2">
  <x-card data-title="公式プラットフォーム" data-icon="lucide:globe">
    AIGNE が運営するサービスである docsmith.aigne.io に公開します。これは、オープンソースプロジェクトやドキュメントを迅速に公開共有するための簡単なオプションです。
  </x-card>
  <x-card data-title="自己ホスト型インスタンス" data-icon="lucide:server">
    ブランディング、アクセス、データプライバシーを完全に制御するために、独自の Discuss Kit インスタンスに公開します。これは、内部またはプライベートなドキュメントに推奨されるオプションです。公式ドキュメントにある指示に従って、独自の Discuss Kit インスタンスを実行できます。
  </x-card>
</x-cards>

## ステップバイステップガイド

以下の手順に従ってドキュメントを公開してください。

### 1. 公開コマンドを実行する

プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. プラットフォームを選択する

初めて公開する場合、宛先を選択するよう求められます。要件に合ったオプションを選択してください。

![公式プラットフォームまたは自己ホスト型プラットフォームにドキュメントを公開する](../assets/screenshots/doc-publish.png)

自己ホスト型のインスタンスを選択した場合、その URL を入力するよう求められます。

### 3. アカウントを認証する

最初の接続では、ブラウザウィンドウが自動的に開き、ログインして CLI を承認します。このステップはプラットフォームごとに一度だけ必要です。アクセストークンは将来の使用のためにローカルに保存されます。

### 4. 確認

アップロードが完了すると、ターミナルに成功メッセージが表示され、ドキュメントが公開されたことを確認します。

```
✅ Documentation Published Successfully!
```

## CI/CD 環境での公開

CI/CD パイプラインのような自動化されたワークフローで公開コマンドを使用するには、引数と環境変数を通じて必要な情報を提供することで、対話型のプロンプトをバイパスできます。

| 方法 | 名前 | 説明 |
|---|---|---|
| **引数** | `--appUrl` | Discuss Kit インスタンスの URL を指定します。 |
| **環境変数** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 対話型のログインプロセスをスキップするためのアクセストークンを提供します。 |

以下は、CI/CD スクリプトに適した非対話型の公開コマンドの例です。

```bash CI/CD の例 icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## トラブルシューティング

公開プロセス中に問題が発生した場合、それは以下の一般的な問題のいずれかが原因である可能性があります。

- **接続エラー**: CLI は `Unable to connect to: <URL>` のようなエラーメッセージを返すことがあります。これは、ネットワークの問題、サーバーが一時的に利用できない、または URL が間違っていることが原因である可能性があります。URL が正しく、サーバーに到達可能であることを確認してください。

- **無効なウェブサイト URL**: コマンドは `The provided URL is not a valid website on ArcBlock platform` というメッセージで失敗することがあります。宛先 URL は ArcBlock プラットフォーム上に構築されたウェブサイトでなければなりません。ドキュメントをホストするには、独自の Discuss Kit インスタンスを実行できます。

- **必要なコンポーネントの欠落**: `This website does not have required components for publishing` というエラーは、宛先のウェブサイトに Discuss Kit コンポーネントがインストールされていないことを示します。サイトに必要なコンポーネントを追加するには、Discuss Kit のドキュメントを参照してください。

コマンドとオプションの完全なリストについては、[CLI コマンドリファレンス](./cli-reference.md) を参照してください。