# 設定

適切な設定は、ドキュメント生成プロセスをプロジェクトの特定の要件に合わせて調整するための基本です。AIGNE DocSmithは、プロジェクト全体の設定用の主要な設定ファイルと、ユーザー設定を管理するための別のコマンドを使用します。このアプローチにより、生成されるドキュメントがプロジェクトの目的、対象読者、および構造的なニーズに正確に合致することが保証されます。

このセクションでは、設定プロセスの概要を説明します。詳細なステップバイステップの手順については、以下のガイドを参照してください。

<x-cards>
  <x-card data-title="初期設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">対話式セットアップを実行して config.yaml ファイルを作成する方法を学びます。これは、新しいプロジェクトで推奨される最初のステップです。</x-card>
  <x-card data-title="ユーザー設定の管理" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">保存されたユーザー設定を表示、有効化、無効化、または削除する方法を理解し、時間をかけてドキュメント生成プロセスを改善します。</x-card>
</x-cards>

## `config.yaml` ファイル

すべてのプロジェクトレベルの設定は、プロジェクトの `.aigne/doc-smith/` ディレクトリにある `config.yaml` という名前のファイルに保存されます。`aigne doc init` コマンドは、対話式のガイド付きプロセスを通じてこのファイルを作成します。また、いつでもテキストエディタでこのファイルを手動で変更して設定を調整することもできます。

以下は、各設定オプションを説明するコメント付きの `config.yaml` ファイルの例です。

```yaml config.yaml icon=logos:yaml
# ドキュメント公開用のプロジェクト情報
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# ドキュメント設定
# =============================================================================

# 目的：読者に達成してもらいたい主な成果は何ですか？
# 利用可能なオプション：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - getStarted
  - completeTasks

# 対象読者：誰が最も頻繁にこれを読みますか？
# 利用可能なオプション：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - endUsers

# 読者の知識レベル：読者がアクセスした時点で、通常どのような知識を持っていますか？
# 利用可能なオプション：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: completeBeginners

# ドキュメントの深さ：ドキュメントはどの程度包括的であるべきですか？
# 利用可能なオプション：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: comprehensive

# カスタムルール：特定のドキュメント生成ルールと要件を定義します
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# 対象読者：特定の対象読者とその特徴を詳細に記述します
targetAudience: |
  
# 用語集：プロジェクト固有の用語と定義を定義します
# glossary: "@glossary.md"  # 用語集の定義を含むマークダウンファイルへのパス

# ドキュメントの主要言語
locale: en

# 翻訳用の追加言語リスト
translateLanguages:
  - zh
  - zh-TW
  - ja

# 生成されたドキュメントが保存されるディレクトリ
docsDir: ./docs

# ドキュメント生成のために分析するソースコードのパス
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml

# =============================================================================
# メディア設定
# =============================================================================

# 画像品質フィルター：この値より幅の広い画像のみが含まれます
# これは、低解像度の画像を除外することで、ドキュメントの品質を維持するのに役立ちます
# 推奨：一般的なドキュメントには 800px、高品質なドキュメントには 1200px
media:
  minImageWidth: 800
```

## ユーザー設定の管理

プロジェクト全体の `config.yaml` に加えて、特定のニーズに合わせてAIの動作を微調整するためのユーザー設定を管理できます。これらの設定はローカルに保存され、プロジェクトの設定ファイルを変更することなく、有効化、無効化、または削除できます。

ユーザー設定は `aigne doc prefs` コマンドを使用して管理され、以下の操作をサポートしています。
*   `--list`: 保存されているすべてのユーザー設定とそのステータス（有効/無効）を表示します。
*   `--remove`: 1つ以上の保存されたユーザー設定を削除します。
*   `--toggle`: 特定のユーザー設定を有効または無効にします。

これらのコマンドの使用に関する完全なガイドについては、[ユーザー設定の管理](./configuration-managing-preferences.md)を参照してください。

## 概要

`config.yaml` を正しく設定し、ユーザー設定を管理することで、プロジェクト、読者、およびドキュメントの目標に対する明確な指示をツールに提供します。これにより、より正確で関連性の高いコンテンツが生成されます。

プロジェクトの設定を開始するには、[初期設定](./configuration-initial-setup.md)ガイドに進んでください。