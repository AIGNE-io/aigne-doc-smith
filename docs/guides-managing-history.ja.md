# 履歴の管理

AIGNE DocSmithは、ドキュメントに加えられたすべての更新の時系列ログを保持します。この機能により、変更を追跡し、更新時に提供されたフィードバックを確認し、時間とともにドキュメントがどのように変化したかを理解できます。このガイドでは、この履歴にアクセスして解釈する方法について説明します。

## 更新履歴の表示

すべてのドキュメント更新のログを表示するには、`history view` コマンドを使用します。このコマンドは、バージョン管理ログのように、各エントリの簡潔な1行の要約を表示します。

ターミナルで次のコマンドを実行してください：

```bash 履歴の表示 icon=material-symbols:history
aigne history view
```

`history` コマンドは、`view` サブコマンドの2つのエイリアス、`log` と `list` もサポートしています。以下のコマンドは同等であり、同じ出力を生成します：

```bash
aigne history log
aigne history list
```

### 履歴出力の理解

`history view` コマンドの出力は、各更新に関する主要な情報を一目でわかるようにフォーマットされています。各行は、1つの更新エントリを表します。

以下にそのフォーマットの内訳を示します：

| コンポーネント | 説明 |
| :--- | :--- |
| **Short Hash** | 更新のタイムスタンプから生成される8文字の一意の識別子。 |
| **Date** | 更新が発生した時期を示す相対的なタイムスタンプ（例：「5 minutes ago」、「2 days ago」）。古いエントリには、特定の日付が表示されます。 |
| **Operation** | `generate_document` や `update_document_detail` など、実行されたアクションの種類。 |
| **Document Path** | 操作が単一ファイルを対象とした場合に、変更された特定のドキュメントのパス。これは括弧で囲まれます。 |
| **Feedback** | 更新が行われたときに提供されたフィードバックまたは要約メッセージ。 |

### 例

以下は `aigne history view` コマンドを実行した際のサンプル出力です。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

このログは、ドキュメントの変更履歴を明確かつ整理された記録として提供し、進捗の追跡や過去の変更の確認に役立ちます。