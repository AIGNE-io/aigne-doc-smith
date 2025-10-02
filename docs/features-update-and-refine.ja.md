# 更新とリファイン

進化するコードベースとドキュメントを同期させることは、体系的なプロセスです。AIGNE DocSmithは、コードの変更に基づく自動更新、またはフィードバックに基づいた正確なリファインによって、コンテンツを最新の状態に保つための直接的で柔軟なコマンドを提供します。

このガイドでは、以下の手順について説明します。

- ソースコードが変更されたときにドキュメントを自動的に更新する。
- 対象を絞ったフィードバックを使用して特定のドキュメントを再生成する。
- ドキュメント全体の構造を調整する。

### ドキュメント更新ワークフロー

以下の図は、ドキュメントを更新するために利用できるさまざまなワークフローを示しています。

```d2 ドキュメント更新ワークフロー
direction: down

developer: {
  shape: c4-person
  label: "開発者"
}

codebase: {
  shape: cylinder
  label: "ソースコード"
}

updated-documentation: {
  shape: cylinder
  label: "更新された\nドキュメント"
}

workflows: {
  label: "ドキュメント更新ワークフロー"
  shape: rectangle

  automatic-updates: {
    label: "自動更新 (コード駆動)"
    shape: rectangle

    cmd-generate: {
      label: "aigne doc generate"
    }

    decision-force: {
      label: "--forceRegenerate?"
      shape: diamond
    }

    detect-changes: {
      label: "変更を検出"
    }

    regen-affected: {
      label: "影響を受ける\nドキュメントを再生成"
    }

    regen-all: {
      label: "すべての\nドキュメントを再生成"
    }
  }

  manual-refinements: {
    label: "手動リファイン (フィードバック駆動)"
    shape: rectangle
    grid-columns: 2
    grid-gap: 100

    refine-individual: {
      label: "個別ドキュメントのリファイン"
      shape: rectangle

      cmd-update: {
        label: "aigne doc update\n--feedback"
      }

      regen-specific: {
        label: "特定の\nドキュメントを再生成"
      }
    }

    optimize-structure: {
      label: "全体構造の最適化"
      shape: rectangle

      cmd-generate-feedback: {
        label: "aigne doc generate\n--feedback"
      }

      re-evaluate-plan: {
        label: "ドキュメント計画\nの再評価"
      }
    }
  }
}

# --- 接続 ---

# パス1: 自動更新
developer -> codebase: "1. 変更を加える"
codebase -> workflows.automatic-updates.cmd-generate: "2. コマンドを実行"
workflows.automatic-updates.cmd-generate -> workflows.automatic-updates.decision-force
workflows.automatic-updates.decision-force -> workflows.automatic-updates.detect-changes: "いいえ"
workflows.automatic-updates.detect-changes -> workflows.automatic-updates.regen-affected
workflows.automatic-updates.decision-force -> workflows.automatic-updates.regen-all: "はい"
workflows.automatic-updates.regen-affected -> updated-documentation
workflows.automatic-updates.regen-all -> updated-documentation

# パス2: 個別リファイン
developer -> workflows.manual-refinements.refine-individual.cmd-update: "3. コンテンツの\nフィードバックを提供"
workflows.manual-refinements.refine-individual.cmd-update -> workflows.manual-refinements.refine-individual.regen-specific
workflows.manual-refinements.refine-individual.regen-specific -> updated-documentation

# パス3: 構造リファイン
developer -> workflows.manual-refinements.optimize-structure.cmd-generate-feedback: "4. 構造に関する\nフィードバックを提供"
workflows.manual-refinements.optimize-structure.cmd-generate-feedback -> workflows.manual-refinements.optimize-structure.re-evaluate-plan
workflows.manual-refinements.optimize-structure.re-evaluate-plan -> updated-documentation: "新しい構造で\n再生成"
```

---

## 変更検出による自動更新

`aigne doc generate`コマンドを実行すると、DocSmithはまずコードベースを分析して、前回の生成以降の変更を検出します。その後、これらの変更によって影響を受けるドキュメントのみを再生成します。このデフォルトの動作により、時間が節約され、APIの使用量が削減されます。

```shell icon=lucide:terminal
# DocSmithは変更を検出し、必要なものだけを更新します
aigne doc generate
```

![DocSmithが変更を検出し、必要なドキュメントのみを再生成します。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 完全な再生成の強制

キャッシュと変更検出をバイパスして、すべてのドキュメントをゼロから再生成するには、`--forceRegenerate`フラグを使用します。これは、大幅な設定変更を行った場合や、一貫性を確保するために完全な再構築が必要な場合に必要です。

```shell icon=lucide:terminal
# すべてのドキュメントをゼロから再生成します
aigne doc generate --forceRegenerate
```

---

## 個別ドキュメントのリファイン

対応するコードの変更なしに特定のドキュメントのコンテンツを改善するには、`aigne doc update`コマンドを使用します。このコマンドを使用すると、リファインのための具体的な指示を提供できます。

これは、対話形式またはコマンドライン引数を使用して非対話形式で行うことができます。

### 対話モード

ガイド付きのプロセスを行うには、引数なしでコマンドを実行します。DocSmithは、更新したいドキュメントを選択するためのメニューを表示します。選択後、フィードバックを入力するよう求められます。

```shell icon=lucide:terminal
# 対話的な更新プロセスを開始します
aigne doc update
```

![更新したいドキュメントを対話形式で選択します。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接的なコマンドライン更新

スクリプト化された、またはより高速なワークフローのために、フラグを使用してドキュメントとフィードバックを直接指定できます。これにより、正確な非対話形式の更新が可能になります。

```shell icon=lucide:terminal
# フィードバック付きで特定のドキュメントを更新します
aigne doc update --docs overview.md --feedback "最後に詳細なFAQセクションを追加してください。"
```

`update`コマンドの主要なパラメータは以下の通りです。

| パラメータ | 説明 |
| --- | --- |
| `--docs` | 更新するドキュメントへのパス。このフラグはバッチ更新のために複数回使用できます。 |
| `--feedback` | コンテンツを再生成する際に使用される具体的な指示。 |

---

## 全体構造の最適化

個々のドキュメントのコンテンツをリファインすることに加えて、ドキュメント全体の構造を調整することもできます。既存の構成が最適でない場合やセクションが欠落している場合は、`generate`コマンドにフィードバックを提供できます。

これにより、DocSmithは入力に基づいてドキュメント計画全体を再評価するように指示されます。

```shell icon=lucide:terminal
# 特定のフィードバックでドキュメント構造を再生成します
aigne doc generate --feedback "'概要'セクションを削除し、詳細な'APIリファレンス'を追加してください。"
```

このアプローチは、ドキュメントの目次に対する高レベルの変更を目的としており、軽微なコンテンツの編集を目的としたものではありません。

コンテンツがリファインされたら、次のステップはグローバルなオーディエンス向けに準備することです。手順については、[ドキュメントの翻訳](./features-translate-documentation.md)ガイドを参照してください。