# コンテンツの更新

このガイドでは、`update` コマンドを使用して既存のドキュメントを修正する方法について説明します。ドキュメントのコンテンツを更新したり、図を追加または更新したり、フィードバックを通じて図を削除したりできます。

## 基本的な使い方

### 対話モード

引数なしでコマンドを実行すると、対話モードに入ります。

```bash icon=lucide:terminal
aigne doc update
```

ドキュメントを選択し、フィードバックを提供して更新します。

### コマンドラインモード

コマンドラインフラグを使用してドキュメントを直接更新します。

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "コア機能についてより詳細な説明を追加してください。"
```

## 図の更新

フィードバックを提供することで、ドキュメント内の図を更新できます。このツールは、既存の図の更新や新しい図の追加をサポートしています。

### 特定の図を更新する

図を更新するためのフィードバックを提供します。

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "新しいアーキテクチャを示すように図を更新してください"
```

### すべての図を更新する

`--diagram` フラグを使用して、図を含むドキュメントをフィルタリングして選択します。

```bash icon=lucide:terminal
aigne doc update --diagram
```

または、`--diagram-all` を使用して、図を含むすべてのドキュメントを自動的に更新します。

```bash icon=lucide:terminal
aigne doc update --diagram-all
```

### 図を削除する

フィードバックを提供して図を削除します。

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "図を削除してください"
```

## 図のスタイル

DocSmith は複数の図スタイルをサポートしています。フィードバックでスタイルを指定するか、デフォルトのスタイルを設定できます。サポートされているスタイルは次のとおりです。

### モダン
現代的なデザイン要素を持つ、クリーンでプロフェッショナルなスタイル。

![Modern Style](../../../assets/images/diagram-styles/modern.jpg)

### 標準フローチャート
従来の記号を使用した伝統的なフローチャートスタイル。

![Standard Flowchart Style](../../../assets/images/diagram-styles/standard.jpg)

### 手書き風
自然で有機的な線を持つスケッチ風のスタイル。

![Hand-drawn Style](../../../assets/images/diagram-styles/hand-drawn.jpg)

### 擬人化
鮮やかで人間のような特徴を持つ、擬人化された要素。

![Anthropomorphic Style](../../../assets/images/diagram-styles/anthropomorphic.jpg)

### フラットデザイン
影や3D効果のないフラットなデザイン。

![Flat Design Style](../../../assets/images/diagram-styles/flat.jpg)

### ミニマリスト
最大限の明瞭さを備えた最小限の要素。

![Minimalist Style](../../../assets/images/diagram-styles/minimalist.jpg)

### 3D
奥行きと遠近感のある三次元効果。

![3D Style](../../../assets/images/diagram-styles/3d.jpg)

## コマンドパラメータ

| パラメータ | 説明 | 必須 |
| :--- | :--- | :--- |
| `--docs` | 更新するドキュメントのパスを指定します。複数回使用できます。 | オプション |
| `--feedback` | 行うべき変更に関するテキスト指示を提供します。 | オプション |
| `--reset` | 既存のコンテンツを無視して、ドキュメントを最初から再作成します。 | オプション |
| `--glossary` | 用語集ファイルへのパス (`@/path/to/glossary.md`) を指定します。 | オプション |
| `--diagram` | 図を含むドキュメントのみを表示し、ユーザーが更新するものを選択できるようにフィルタリングします。 | オプション |
| `--diagram-all` | 図を含むすべてのドキュメントを自動選択し、ユーザーの選択なしで更新します。 | オプション |

---

ドキュメントの追加または削除については、[ドキュメントの追加](./guides-adding-a-document.md) および [ドキュメントの削除](./guides-removing-a-document.md) のガイドを参照してください。