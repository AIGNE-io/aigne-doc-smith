# 履歴の管理

ドキュメントにいつ、どのような変更が加えられたか気になったことはありませんか？AIGNE DocSmith は、すべての更新の詳細なログを保持します。このガイドでは、この履歴にアクセスして読む方法を説明し、ドキュメントの変遷を簡単に追跡できるようにします。

## 更新履歴の表示

すべてのドキュメント更新のログを確認するには、`history view` コマンドを使用できます。このコマンドは、バージョン管理システムのログのように、各変更のコンパクトな一行の要約を提供します。

プロジェクトのルートディレクトリから以下のコマンドを実行します：

```bash 履歴ログを表示 icon=lucide:history
aigne doc history view
```

### コマンドエイリアス

利便性のため、`history` コマンドには `view` サブコマンドのエイリアスとして `log` と `list` の2つが含まれています。これらのコマンドは全く同じ機能を実行し、同一の出力を生成します。

ショートカットとして、以下のいずれかのコマンドを使用できます：

```bash
aigne doc history log
```

```bash
aigne doc history list
```

まだ更新を行っていない場合、ツールは `No update history found` というメッセージで通知します。

## 履歴出力の理解

`history` コマンドの出力は、各更新の概要が一目でわかるように設計されています。ログの各行は、単一の更新イベントを表します。

各エントリのフォーマットは以下のように分類されます：

| コンポーネント | 説明 |
| :--- | :--- |
| **Short Hash** | 更新のタイムスタンプから生成される一意の8文字の識別子。このハッシュは決定論的であり、同じタイムスタンプは常に同じハッシュを生成します。 |
| **Date** | 更新が発生した日時を示す相対的なタイムスタンプ（例：「5分前」、「2日前」）。1週間以上前のエントリには、特定の日付が表示されます。 |
| **Operation** | 実行されたアクションの種類。`generate_document` や `update_document_detail` など。 |
| **Document Path** | 操作が単一のファイルに特化していた場合に、変更されたドキュメントのパス。明確にするために括弧内に表示されます。 |
| **Feedback** | 更新時に提供された要約またはフィードバックメッセージ。 |

### 出力例

以下は、`aigne doc history view` コマンドを実行した際に表示される可能性のある出力のサンプルです。この例は、さまざまな種類の更新がログにどのように記録されるかを示しています。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

このログは、すべての変更を整然とかつスキャン可能な記録として提供し、進捗の追跡やドキュメントの履歴レビューに役立つツールとなります。