ドキュメントに抜けがあると感じたことはありませんか？ `aigne doc add-document` コマンドは、既存のドキュメント構造に新しいトピックを導入するための、わかりやすくインタラクティブな方法を提供し、プロジェクトと共にコンテンツが成長することを保証します。

# ドキュメントの追加

`aigne doc add-document` コマンドは、エイリアス `aigne doc add` でも利用可能で、プロジェクトのドキュメント構造に1つまたは複数の新しいドキュメントを追加するためのインタラクティブなセッションを開始します。新しいファイルを追加するだけでなく、既存のドキュメントを関連リンクでインテリジェントに更新し、新しいコンテンツが見つけやすくなるようにします。

## コマンドの使用方法

プロセスを開始するには、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

このコマンドは、プロセスを案内するインタラクティブなウィザードを起動します。

## プロセス

このコマンドは、新しいドキュメントをシームレスに統合するために、構造化されたステップバイステップのプロセスに従います。

### 1. 新しいドキュメントをインタラクティブに追加

コマンドはまず現在のドキュメント構造を表示し、次に新しいドキュメントを指定するように促します。リクエストは自然言語で記述できます。ドキュメントは1つずつ追加できます。追加するたびに、ツールは更新された構造を表示し、別のドキュメントを追加するように促します。ドキュメントの追加を終了するには、何も入力せずに `Enter` キーを押すだけです。

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 2. 既存ドキュメントのレビューとリンク

ドキュメントの追加が完了すると、DocSmithは既存のコンテンツを分析し、新しいドキュメントへのリンクから恩恵を受けるドキュメントを特定します。その後、これらのドキュメントのリストが表示され、ツールに変更を加えたいものをレビューして選択できます。このステップにより、既存のコンテンツへの変更を完全に制御できます。

![ドキュメント更新選択画面のスクリーンショット。](../../../assets/screenshots/doc-update.png)

### 3. コンテンツ生成と翻訳

確認後、システムは主に2つのタスクを並行して進めます。
*   **コンテンツの生成:** 追加した新しいドキュメントの完全なコンテンツを作成します。
*   **リンクの更新:** 選択した既存のドキュメントを修正して、新しいページへのリンクを含めます。

複数の言語を設定している場合、新しいドキュメントと更新されたドキュメントの両方が自動的に翻訳キューに追加されます。

### 4. サマリーレポート

最後に、コマンドは実行された操作のサマリーを出力します。このレポートには、新しく作成されたすべてのドキュメントのリストと、新しいリンクで更新されたすべての既存ドキュメントのリストが含まれます。

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

この構造化されたプロセスにより、新しいドキュメントが単に作成されるだけでなく、既存のコンテンツの構造に織り込まれ、ナビゲーションと発見可能性が向上します。