# ドキュメントの削除

ドキュメントを正確に保つには、コンテンツを追加するだけでなく、整理することも重要です。このガイドでは、`aigne doc remove-document` コマンドを使用してプロジェクトからドキュメントを安全に削除し、ドキュメントセットをクリーンで関連性の高い状態に保つ方法について詳しく説明します。

## 概要

`remove-document` コマンドは、既存の構造から1つまたは複数のドキュメントを選択して削除する対話的な方法を提供します。このコマンドの重要な機能は、カスケード削除を処理できることです。つまり、親ドキュメントを削除すると、そのすべての子ドキュメントも削除されます。

さらに、選択されたドキュメントが削除された後、ツールは残りのファイルを自動的にスキャンし、削除されたドキュメントを指していた壊れたリンクを検出します。その後、これらのリンクをインテリジェントに修正または削除しようとし、ドキュメントセット全体の整合性を確保します。

## コマンドの使用方法

削除プロセスを開始するには、プロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```sh icon=lucide:terminal
aigne doc remove-document
```

より短いエイリアス `remove` または `rm` も使用できます。

```sh icon=lucide:terminal
aigne doc rm
```

### 1. ドキュメントの選択と確認

コマンドを実行すると、現在のドキュメントのリストが階層的なツリー構造で表示されます。矢印キーを使用してこのリストをナビゲートし、スペースバーを押して削除したいドキュメントを選択できます。削除するすべてのドキュメントを選択したら、`Enter` を押して確定します。ドキュメントを削除しない場合は、何も選択せずに `Enter` を押すと操作をキャンセルできます。

```sh Select documents to remove icon=lucide:terminal
? Select documents to remove (Press Enter with no selection to finish):
❯◯ /overview
 ◯ /getting-started
 ◯ /guides
  ◯ /guides/generating-documentation
  ◯ /guides/updating-documentation
   ◉ /guides/updating-documentation/adding-a-document
   ◉ /guides/updating-documentation/removing-a-document
```

### 2. リンクの検証と修正

ドキュメントが削除された後、DocSmith は残りのドキュメントを自動的にスキャンし、存在しないファイルを指しているリンクを検出します。これらの無効なリンクを自動的に修正するかどうかの確認を求められます。

```sh Confirm link fixing icon=lucide:terminal
? Select documents with invalid links to fix (all selected by default, press Enter to confirm, or unselect all to skip):
❯◉ Update Document (/guides/updating-documentation.md) - Invalid Links(2): /guides/adding-a-document, /guides/removing-a-document
```

### 3. サマリーの確認

最後に、ターミナルにサマリーが表示され、正常に削除されたすべてのドキュメントと、無効なリンクが修正されたドキュメントの詳細がリストされます。

```sh Removal summary icon=lucide:terminal
---
📊 Summary

🗑️  Removed Documents:
   Total: 2 document(s)

   1. /guides/adding-a-document
   2. /guides/removing-a-document

✅ Documents fixed (Removed invalid links):
   Total: 1 document(s)

   1. /guides/updating-documentation
      Invalid links fixed: /guides/adding-a-document, /guides/removing-a-document
```

このプロセスにより、ファイルの削除が簡単になり、他のドキュメントに壊れた参照が残らないようになります。

## 関連ガイド

ドキュメントを整理した後、他の更新が必要になる場合があります。ドキュメント構造の管理に関する詳細については、以下のガイドを参照してください。

<x-cards data-columns="2">
  <x-card data-title="ドキュメントの追加" data-icon="lucide:file-plus" data-href="/guides/adding-a-document">
    既存のドキュメント構造に新しいドキュメントを追加する方法を学びます。
  </x-card>
  <x-card data-title="ドキュメントの更新" data-icon="lucide:file-pen-line" data-href="/guides/updating-document">
    既存のドキュメントのコンテンツを修正する方法をご覧ください。
  </x-card>
</x-cards>