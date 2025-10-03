# 更新とリファイン

進化するコードベースとドキュメントの同期を保つことは、系統的なプロセスです。AIGNE DocSmithは、コードの変更に基づく自動更新、またはフィードバックに基づいた正確なリファインによって、コンテンツを最新の状態に保つための直接的で柔軟なコマンドを提供します。

このガイドでは、以下のタスクの手順を説明します。

*   ソースコードが変更されたときにドキュメントを自動的に更新する。
*   ターゲットを絞ったフィードバックを使用して特定のドキュメントを再生成する。
*   ドキュメント全体の構造を調整する。

### ドキュメント更新ワークフロー

次の図は、ドキュメントを更新するために利用できるさまざまなワークフローを示しています。

```d2 ドキュメント更新ワークフロー
direction: down

Developer: {
  shape: c4-person
}

Source-Code: {
  label: "ソースコード"
}

Documentation: {
  label: "ドキュメント"
}

Action-Choice: {
  label: "アクションを選択"
  shape: diamond
}

Generate-Sync: {
  label: "aigne doc generate"
  shape: rectangle

  Change-Detection: {
    label: "変更を検出？"
    shape: diamond
  }
  Regenerate-Affected: "影響を受けるものを再生成"
  Regenerate-All: "すべてを再生成"

  Change-Detection -> Regenerate-Affected: "はい（デフォルト）"
  Change-Detection -> Regenerate-All: "いいえ\n(--forceRegenerate)"
}

Refine-Content: {
  label: "aigne doc update"
}

Refine-Structure: {
  label: "aigne doc generate\n--feedback"
}

Developer -> Action-Choice

Action-Choice -> Generate-Sync: "コードと同期"
Action-Choice -> Refine-Content: "ドキュメント内容のリファイン"
Action-Choice -> Refine-Structure: "ドキュメント構造のリファイン"

Source-Code -> Generate-Sync

Generate-Sync.Regenerate-Affected -> Documentation: "更新"
Generate-Sync.Regenerate-All -> Documentation: "更新"
Refine-Content -> Documentation: "更新"
Refine-Structure -> Documentation: "更新"
```

---

## 変更検出による自動更新

`aigne doc generate`コマンドを実行すると、DocSmithはまずコードベースを分析して、最後の生成以降の変更を検出します。次に、これらの変更によって影響を受けるドキュメントのみを再生成します。このデフォルトの動作により、冗長な操作を避けることで時間とAPI使用量を節約します。

```shell icon=lucide:terminal
# DocSmithが変更を検出し、必要なものだけを更新します
aigne doc generate
```

![DocSmithが変更を検出し、必要なドキュメントのみを再生成します。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 完全な再生成の強制

キャッシュと変更検出をバイパスしてすべてのドキュメントをゼロから再生成するには、`--forceRegenerate`フラグを使用します。これは、大幅な設定変更を行った場合や、すべてのファイル間で一貫性を確保するために完全な再構築が必要な場合に必要です。

```shell icon=lucide:terminal
# すべてのドキュメントをゼロから再生成します
aigne doc generate --forceRegenerate
```

---

## フィードバックによるドキュメントのリファイン

CLIコマンドに直接フィードバックを提供することで、対応するコードの変更なしにドキュメントをリファインできます。これは、明確さの向上、例の追加、または構造の調整に役立ちます。

### 個別ドキュメント内容のリファイン

特定のドキュメントの内容を改善するには、`aigne doc update`コマンドを使用します。このコマンドを使用すると、リファインのためのターゲットを絞った指示を提供でき、インタラクティブモードと非インタラクティブモードの2つのモードで実行できます。

#### インタラクティブモード

ガイド付きプロセスの場合、引数なしでコマンドを実行します。DocSmithは、更新したいドキュメントを選択するためのメニューを表示します。選択後、フィードバックを入力するよう求められます。

```shell icon=lucide:terminal
# インタラクティブな更新プロセスを開始します
aigne doc update
```

![更新したいドキュメントをインタラクティブに選択します。](../assets/screenshots/doc-update.png)

#### 非インタラクティブモード

スクリプト化された、またはより高速なワークフローの場合、フラグを使用してドキュメントとフィードバックを直接指定できます。これにより、正確な非インタラクティブな更新が可能になります。

```shell icon=lucide:terminal
# 特定のドキュメントをフィードバックで更新します
aigne doc update --docs overview.md --feedback "最後に詳細なFAQセクションを追加してください。"
```

`update`コマンドの主要なパラメータは次のとおりです。

| パラメータ  | 説明                                                                                         |
| :--------- | :--------------------------------------------------------------------------------------------------- |
| `--docs`     | 更新対象のドキュメントへのパス。このフラグはバッチ更新のために複数回使用できます。      |
| `--feedback` | ドキュメントの内容を再生成する際に使用される具体的な指示を含む文字列。 |

### 全体構造の最適化

個々のドキュメントのリファインに加えて、ドキュメント全体の構造を調整することもできます。既存の構成が最適でない場合やセクションが欠落している場合は、`generate`コマンドにフィードバックを提供できます。これにより、DocSmithはあなたの入力に基づいてドキュメントプラン全体を再評価します。

```shell icon=lucide:terminal
# 特定のフィードバックでドキュメント構造を再生成します
aigne doc generate --feedback "「概要」セクションを削除し、詳細な「APIリファレンス」を追加してください。"
```

このアプローチは、単一ファイル内のマイナーなコンテンツ編集ではなく、ドキュメントの目次に対する高レベルの変更を目的としています。

コンテンツがリファインされたら、次のステップはグローバルなオーディエンス向けに準備することです。手順については、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドを参照してください。