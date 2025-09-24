# 更新と改良

進化するコードベースとドキュメントを同期させることは、重要なタスクです。AIGNE DocSmithは、コードの変更に基づく自動更新や、フィードバックに基づいた正確な改良を通じて、コンテンツを最新の状態に保つための直接的で柔軟な方法を提供します。

このガイドでは、以下の方法について説明します：

- ソースコードが変更されたときにドキュメントを自動的に更新する。
- 特定のフィードバックを使用して特定のドキュメントを再生成する。
- ドキュメント全体の構造を調整する。

### ドキュメント更新のワークフロー

以下の図は、ドキュメントを更新するために利用できるさまざまなパスを示しています：

```d2 更新ワークフロー
direction: down

Start: {
  shape: circle
  label: "開始"
}

Code-Change: {
  label: "ソースコードまたは\n設定の変更"
  shape: rectangle
}

Content-Tweak: {
  label: "コンテンツの\n改善が必要か？"
  shape: rectangle
}

Structure-Tweak: {
  label: "構造の\n改善が必要か？"
  shape: rectangle
}

Start -> Code-Change
Start -> Content-Tweak
Start -> Structure-Tweak

Code-Change -> Generate-Command: "aigne doc generate"

Generate-Command -> Change-Detection: {
  label: "変更検出"
  shape: diamond
}
Change-Detection -> Auto-Regen: "影響を受ける\nドキュメントを再生成"

Content-Tweak -> Update-Command: "aigne doc update\n--feedback"
Update-Command -> Manual-Regen: "特定の\nドキュメントを再生成"

Structure-Tweak -> Generate-Feedback-Command: "aigne doc generate\n--feedback"
Generate-Feedback-Command -> Replan: "ドキュメント構造を\n再計画"

End: {
  shape: circle
  label: "ドキュメント更新済み"
}

Auto-Regen -> End
Manual-Regen -> End
Replan -> End
```

---

## 変更検出による自動更新

`aigne doc generate` コマンドを実行すると、DocSmithはコードベースを分析し、前回の実行からの変更を検出し、影響を受けるドキュメントのみを再生成します。このプロセスにより、時間を節約し、不要なAPI呼び出しを削減できます。

```shell icon=lucide:terminal
# DocSmithが変更を検出し、必要なものだけを更新します
aigne doc generate
```

![DocSmithが変更を検出し、必要なドキュメントのみを再生成します。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 完全な再生成を強制する

キャッシュや以前の状態を無視して、すべてのドキュメントを最初から再生成する必要がある場合は、`--forceRegenerate` フラグを使用します。これは、大幅な設定変更後や、完全に新しいビルドを確実にしたい場合に便利です。

```shell icon=lucide:terminal
# すべてのドキュメントをゼロから再生成します
aigne doc generate --forceRegenerate
```

---

## 個々のドキュメントの改良

対応するコードの変更なしに特定のドキュメントを改善するために、`aigne doc update` コマンドを使用すると、コンテンツの改良に関する的を絞った指示を提供できます。

このコマンドは、対話形式またはコマンドライン引数を介して直接、2つの方法で使用できます。

### 対話モード

ガイド付きの体験をしたい場合は、引数なしでコマンドを実行します。DocSmithは、更新したいドキュメントを選択するためのメニューを表示します。選択後、フィードバックを入力するよう求められます。

```shell icon=lucide:terminal
# 対話式の更新プロセスを開始します
aigne doc update
```

![更新したいドキュメントを対話形式で選択します。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接的なコマンドライン更新

より高速なワークフローやスクリプト作成のために、フラグを使用してドキュメントとフィードバックを直接指定できます。これにより、正確で非対話的な更新が可能になります。

```shell icon=lucide:terminal
# 特定のドキュメントにフィードバックを付けて更新します
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

`update` コマンドの主要なパラメータ：

| パラメータ  | 説明                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `--docs`     | 更新したいドキュメントへのパス。バッチ更新のためにこのフラグを複数回使用できます。 |
| `--feedback` | コンテンツを再生成する際に使用する具体的な指示。                       |

---

## 全体構造の最適化

個々のドキュメントのコンテンツを改良するだけでなく、ドキュメント全体の構造も調整できます。セクションが欠けている場合や、既存の構成を改善できる場合は、`generate` コマンドにフィードバックを提供できます。

このコマンドは、DocSmithに新しい入力に基づいてドキュメントプラン全体を再評価するよう指示します。

```shell icon=lucide:terminal
# 特定のフィードバックを付けてドキュメント構造を再生成します
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

このアプローチは、行単位のコンテンツ編集ではなく、ドキュメントの目次に対する高レベルの変更に最適です。

これらのツールを使用すると、プロジェクトと共に進化する正確なドキュメントを維持できます。コンテンツが改良されたら、世界中のオーディエンスに公開できます。その方法については、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドで学んでください。