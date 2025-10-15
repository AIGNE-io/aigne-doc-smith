# 履歴の管理

AIGNE DocSmithは、ドキュメントに加えられたすべての更新を時系列のログとして記録します。この機能により、変更の追跡、各更新で提供されたフィードバックの確認、そして時間の経過に伴うドキュメントの進化を観察することができます。このガイドでは、この履歴ログにアクセスし、解釈する方法について説明します。

## 更新履歴の表示

すべてのドキュメント更新のログを表示するには、`history view`コマンドを使用します。このコマンドは、各エントリのコンパクトな1行の要約を、バージョン管理ログと同様の形式で表示します。

プロジェクトのルートディレクトリで以下のコマンドを実行してください：

```bash 履歴の表示 icon=material-symbols:history
aigne history view
```

便宜上、`history`コマンドは`view`サブコマンドに対して`log`と`list`という2つのエイリアスもサポートしています。以下のコマンドは上記のコマンドと等価であり、同一の出力を生成します：

```bash
aigne history log
```

```bash
aigne history list
```

まだ更新が行われていない場合、ツールは`No update history found`というメッセージを表示します。

### 履歴出力の理解

`history view`コマンドの出力は、各更新に関する主要な情報を簡潔な形式で提供するように構成されています。ログの各行は、単一の更新イベントを表します。

フォーマットは以下のコンポーネントで構成されています：

| コンポーネント | 説明 |
| :--- | :--- |
| **短いハッシュ** | 更新のタイムスタンプから生成される8文字の一意の識別子。このハッシュは決定的であり、同じタイムスタンプは常に同じハッシュを生成します。 |
| **日付** | 更新が発生した時期を示す相対的なタイムスタンプ（例：「5分前」、「2日前」）。1週間以上前のエントリには、特定の日付が表示されます。 |
| **操作** | 実行されたアクションの種類（例：`generate_document`や`update_document_detail`）。 |
| **ドキュメントパス** | 操作が単一のファイルを対象としていた場合、変更された特定のドキュメントのパス。わかりやすくするために括弧で囲まれています。 |
| **フィードバック** | 更新が実行されたときに提供された要約メッセージまたはフィードバック。 |

### 出力例

以下は、`aigne history view`コマンドを実行した際のサンプル出力です。この例は、さまざまな操作がログにどのように記録されるかを示しています。

```bash
📜 更新履歴

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

このログは、ドキュメントの変更履歴を明確かつ整然と記録するものであり、進捗の追跡や過去の変更のレビューに効果的なツールです。