ドキュメントに抜け漏れがあると感じたことはありませんか？ `aigne doc add-document` コマンドは、既存のドキュメント構造に新しいトピックを導入するための、わかりやすくインタラクティブな方法を提供し、プロジェクトの成長に合わせてコンテンツを確実に拡張します。

# ドキュメントの追加

`aigne doc add-document` コマンドは、エイリアス `aigne doc add` でも利用可能で、プロジェクトのドキュメント構造に1つ以上の新しいドキュメントを追加するためのインタラクティブセッションを開始します。このコマンドは、新しいファイルを追加するだけでなく、既存のドキュメントを関連リンクでインテリジェントに更新し、新しいコンテンツが見つけやすくなるようにします。

## コマンドの使用法

プロセスを開始するには、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

このコマンドは、プロセスを案内するインタラクティブなウィザードを起動します。

## プロセス

このコマンドは、新しいドキュメントをシームレスに統合するために、構造化されたステップバイステップのプロセスに従います。

### 1. 初期のプロンプト

コマンドはまず現在のドキュメント構造を表示し、次に追加したい新しいドキュメントを指定するように促します。リクエストは自然言語で記述できます。

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish:
```

### 2. ドキュメントの追加

ドキュメントを1つずつ追加できます。追加するたびに、ツールは更新された構造を表示し、別のドキュメントを追加するように促します。ドキュメントの追加を完了するには、何も入力せずに `Enter` を押すだけです。

```sh
You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 3. 自動リンク分析

ドキュメントの追加が完了すると、DocSmith は新しい追加内容と既存のコンテンツを分析します。そして、既存のドキュメントのうち、新しく追加したドキュメントへのリンクを追加することでメリットがあるものを特定します。

### 4. 更新内容のレビューと確認

DocSmith は、新しいリンクの追加を提案する既存のドキュメントのリストを提示します。このリストを確認し、ツールに変更を加えたいドキュメントを選択できます。このステップにより、既存のコンテンツへの変更を完全に制御できます。

![ドキュメント更新選択画面のスクリーンショット。](../../../assets/screenshots/doc-update.png)

### 5. コンテンツ生成と翻訳

確認後、システムは並行して2つの主要なタスクに進みます。
*   **コンテンツの生成：** 追加した新しいドキュメントの完全なコンテンツを作成します。
*   **リンクの更新：** 選択された既存のドキュメントを修正し、新しいページへのリンクを含めます。

複数の言語を設定している場合、新しいドキュメントと更新されたドキュメントの両方が自動的に翻訳キューに追加されます。

### 6. サマリーレポート

最後に、コマンドは実行された操作のサマリーを出力します。このレポートには、新しく作成されたすべてのドキュメントのリストと、新しいリンクで更新されたすべての既存のドキュメントのリストが含まれます。

```text
📊 Summary

✨ Added Documents:
   Total: 1 document(s)

   1. /guides/deployment-guide - Deployment Guide

✅ Documents updated (Added new links):
   Total: 2 document(s)

   1. /overview - Overview
      New links added: /guides/deployment-guide

   2. /getting-started - Getting Started
      New links added: /guides/deployment-guide
```

この構造化されたプロセスにより、新しいドキュメントが単に作成されるだけでなく、既存のコンテンツの構造に織り込まれ、ナビゲーションと見つけやすさが向上します。