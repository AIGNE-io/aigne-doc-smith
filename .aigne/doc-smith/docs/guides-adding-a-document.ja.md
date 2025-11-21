ドキュメントに抜けがあることに気づいたことはありますか？`aigne doc add-document` コマンドは、既存のドキュメント構造に新しいトピックを導入するための、わかりやすくインタラクティブな方法を提供し、プロジェクトと共にコンテンツが成長することを保証します。

# ドキュメントの追加

`aigne doc add-document` コマンドは、エイリアス `aigne doc add` でも利用可能で、プロジェクトのドキュメント構造に1つまたは複数の新しいドキュメントを追加するためのインタラクティブなセッションを開始します。新しいファイルを追加するだけでなく、既存のドキュメントをインテリジェントに更新し、関連リンクを追加して新しいコンテンツが見つけやすくなるようにします。

## コマンドの使用方法

プロセスを開始するには、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

あるいは、より短いエイリアス `add` を使用することもできます。

```sh aigne doc add icon=lucide:terminal
aigne doc add
```

このコマンドは、プロセスをガイドするインタラクティブなウィザードを起動します。

## プロセス

このコマンドは、新しいドキュメントをシームレスに統合するために、構造化されたステップバイステップのプロセスに従います。

### 1. 新しいドキュメントをインタラクティブに追加

コマンドはまず現在のドキュメント構造を表示し、次に新しいドキュメントを指定するように促します。リクエストは自然言語で記述できます。ドキュメントは一つずつ追加できます。追加するたびに、ツールは更新された構造を表示し、別のドキュメントを追加するように促します。ドキュメントの追加を完了するには、何も入力せずに `Enter` を押すだけです。

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

### 2. 既存ドキュメントのレビューとリンク付け

ドキュメントの追加が完了すると、DocSmith は既存のコンテンツを分析し、新しいドキュメントへのリンクを追加することで恩恵を受けるドキュメントを特定します。その後、これらのドキュメントのリストを提示し、ツールが変更すべきドキュメントをレビューして選択できるようにします。このステップにより、既存のコンテンツへの変更を完全に制御できます。

デフォルトでは、提案されたすべてのドキュメントが選択されています。`Space` キーを押して項目の選択を解除し、`Enter` キーで選択を確定できます。

```sh
? Select documents that need new links added (all selected by default, press Enter to confirm, or unselect all to skip):
❯ ◯ Overview (overview.md)
  ◯ Getting Started (getting-started.md)
  ◉ Guides (guides.md)
```

### 3. コンテンツ生成と翻訳

確認後、システムは並行して2つの主要なタスクを進めます。
*   **コンテンツの生成:** 追加した新しいドキュメントの完全なコンテンツを作成します。
*   **リンクの更新:** 選択された既存のドキュメントを修正し、新しいページへのリンクを含めます。

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

## 関連ガイド

その他のドキュメント管理タスクについては、以下のガイドを参照してください。

<x-cards data-columns="2">
  <x-card data-title="ドキュメントの削除" data-icon="lucide:file-minus" data-href="/guides/removing-a-document">
    プロジェクトからドキュメントを削除する方法を学びます。
  </x-card>
  <x-card data-title="コンテンツの更新" data-icon="lucide:file-pen" data-href="/guides/updating-document">
    既存のドキュメントのコンテンツを修正する方法をご覧ください。
  </x-card>
</x-cards>