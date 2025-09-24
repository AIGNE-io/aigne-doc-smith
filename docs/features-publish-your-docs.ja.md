# ドキュメントを公開する

ドキュメントを生成した後、`aigne doc publish`コマンドはコンテンツをDiscuss Kitプラットフォームにアップロードし、オンラインでアクセスできるようにします。このガイドでは、公式プラットフォームまたは自己ホスト型のウェブサイトにドキュメントを公開する方法について説明します。

## 公開プロセス

`aigne doc publish`コマンドは対話的なプロセスを開始します。新しい宛先に初めて公開する場合、認証プロセスが案内されます。その後の公開では、保存された認証情報が使用されます。

```d2 公開フロー icon=lucide:upload-cloud
direction: down
shape: sequence_diagram

ユーザー: { shape: c4-person }
CLI: { label: "AIGNE CLI" }
ブラウザ: { label: "ブラウザ" }
プラットフォーム: { label: "Discuss Kit プラットフォーム" }

ユーザー -> CLI: "aigne doc publish"

alt: "初回公開または設定がない場合" {
  CLI -> ユーザー: "プラットフォームを選択\n(公式 / 自己ホスト型)"
  ユーザー -> CLI: "選択を提供"
  CLI -> ブラウザ: "認証URLを開く"
  ユーザー -> ブラウザ: "ログインして承認"
  ブラウザ -> プラットフォーム: "認証情報を送信"
  プラットフォーム -> CLI: "アクセストークンを返す"
  CLI -> CLI: "今後の使用のためにトークンを保存"
}

CLI -> プラットフォーム: "ドキュメントとメディアファイルをアップロード"
プラットフォーム -> CLI: "成功応答"
CLI -> ユーザー: "✅ 公開成功！"

```

## 公開オプション

ドキュメントをホストするための主なオプションは2つあります：

<x-cards data-columns="2">
  <x-card data-title="公式プラットフォーム" data-icon="lucide:globe">
    AIGNEが提供する無料の公開ホスティングプラットフォームである[docsmith.aigne.io](https://docsmith.aigne.io/app/)に公開します。これはオープンソースプロジェクトやドキュメントを迅速に共有するのに良い選択肢です。
  </x-card>
  <x-card data-title="独自のウェブサイト" data-icon="lucide:server">
    アクセスとブランディングを完全に制御するために、独自のDiscuss Kitインスタンスに公開します。これは内部またはプライベートなドキュメントに適しています。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu)からDiscuss Kitインスタンスを入手できます。
  </x-card>
</x-cards>

## ステップバイステップガイド

初めてドキュメントを公開するには、以下の手順に従ってください。

### 1. 公開コマンドを実行する

プロジェクトのルートディレクトリで、次のコマンドを実行します：

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. プラットフォームを選択する

初めて公開する場合、宛先を選択するように求められます。ニーズに合ったオプションを選択してください。

![公式プラットフォームまたは自己ホスト型インスタンスから選択](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

独自のウェブサイトを選択した場合、そのURLを入力するように求められます。

### 3. アカウントを認証する

新しいプラットフォームへの最初の接続では、ブラウザウィンドウが開き、ログインしてCLIを承認します。これはプラットフォームごとに一度だけのステップです。アクセストークンは将来の使用のためにローカルの`~/.aigne/doc-smith-connected.yaml`に保存されます。

### 4. 確認

アップロードが完了すると、ターミナルに成功メッセージが表示されます。

```
✅ ドキュメントが正常に公開されました！
```

## CI/CD環境での公開

自動化されたワークフローの場合、引数と環境変数を提供して対話型プロンプトをバイパスできます。

| 方法 | 名前 | 説明 |
|---|---|---|
| **引数** | `--appUrl` | Discuss KitインスタンスのURLを直接指定します。 |
| **環境変数** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | アクセストークンを提供し、対話型ログインをスキップします。 |

以下は、CI/CDパイプラインに適した非対話型の公開コマンドの例です：

```bash CI/CD Example icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## トラブルシューティング

公開中に問題が発生した場合は、これらの一般的な問題を確認してください：

- **接続エラー**: 自己ホスト型インスタンスに提供されたURLが正しくないか、サーバーに到達できない可能性があります。URLとネットワーク接続を確認してください。

- **無効なウェブサイトURL**: URLはArcBlockプラットフォーム上に構築された有効なウェブサイトを指している必要があります。CLIは`The provided URL is not a valid website on ArcBlock platform`のようなエラーを表示します。ドキュメントをホストするには、まず[ストアからDiscuss Kitインスタンスを取得](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu)することから始めることができます。

- **必須コンポーネントの欠落**: 宛先のウェブサイトにはDiscuss Kitコンポーネントがインストールされている必要があります。欠落している場合、CLIは`This website does not have required components for publishing`のようなエラーを返します。[Discuss Kitのドキュメント](https://www.arcblock.io/docs/web3-kit/en/discuss-kit)を参照して、必要なコンポーネントを追加してください。

コマンドとオプションの完全なリストについては、[CLIコマンドリファレンス](./cli-reference.md)を参照してください。