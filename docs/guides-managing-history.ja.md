# 履歴の管理

AIGNE DocSmithは、ドキュメントに加えられたすべての更新の時系列ログを保持します。この機能により、変更を追跡し、更新時に提供されたフィードバックを確認し、時間とともにドキュメントがどのように進化してきたかを理解できます。このガイドでは、この履歴にアクセスして解釈する方法について説明します。

## 更新履歴の表示

すべてのドキュメント更新のログを表示するには、`history view` コマンドを使用します。このコマンドは、バージョン管理ログのように、各エントリの簡潔な1行の概要を表示します。

ターミナルで次のコマンドを実行してください。

```bash 履歴の表示 icon=material-symbols:history
aigne history view
```

`history` コマンドは、`view` サブコマンドの2つのエイリアス、`log` と `list` もサポートしています。以下のコマンドは同等であり、同じ出力を生成します。

```bash
aigne history log
```

```bash
aigne history list
```

### 履歴出力の理解

`history view` コマンドの出力は、各更新に関する主要な情報を一目でわかるようにフォーマットされています。各行は単一の更新エントリを表します。

以下にそのフォーマットの内訳を示します。

| コンポーネント | 説明 |
| :--- | :--- |
| **短いハッシュ** | 更新のタイムスタンプから生成される7文字の一意の識別子。 |
| **日付** | 更新が発生した時期を示す相対的なタイムスタンプ（例：「5分前」、「2日前」）。古いエントリについては、特定の日付が表示されます。 |
| **操作** | 実行されたアクションの種類。例：`generate-document` や `update-document-detail`。 |
| **ドキュメントパス** | 操作が単一のファイルを対象とした場合に、変更された特定のドキュメントのパス。これは括弧で囲まれています。 |
| **フィードバック** | 更新が行われたときに提供されたフィードバックまたは概要メッセージ。 |

### 例

以下は、`aigne history view` コマンドを実行した際のサンプル出力です。

```bash
📜 更新履歴

e5a4f8b 2 hours ago update-document-detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d 1 day ago  update-document-detail (/overview): Refined the introduction to be more concise.
f8d2e0c 3 days ago generate-document (/guides/managing-history): Initial generation of the history management guide.
```

このログは、ドキュメントの変更履歴を明確かつ整然と記録するもので、進捗の追跡や過去の変更の確認に役立ちます。