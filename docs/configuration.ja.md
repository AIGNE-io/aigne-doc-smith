# 設定

適切な設定は、プロジェクト固有のニーズに合わせてドキュメント生成プロセスを調整するために不可欠です。AIGNE DocSmithは、主要な設定ファイルとコマンドラインインターフェースを使用して設定を管理します。このセットアップにより、生成されるドキュメントがプロジェクトの目標、対象読者、構造的要件を正確に反映することが保証されます。

このセクションでは、ツールの設定方法の概要を説明します。ステップバイステップの手順については、以下の詳細なガイドを参照してください。

<x-cards>
  <x-card data-title="初期設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">対話式セットアップを実行して `config.yaml` ファイルを作成する方法を学びます。これは、新しいプロジェクトで推奨される最初のステップです。</x-card>
  <x-card data-title="設定の管理" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">保存された設定を表示、有効化、無効化、または削除する方法を理解し、時間とともにドキュメント生成プロセスを洗練させます。</x-card>
</x-cards>

## `config.yaml` ファイル

すべてのプロジェクトレベルの設定は、プロジェクト内の `.aigne/doc-smith/` ディレクトリにある `config.yaml` という名前のファイルに保存されます。`aigne doc init` コマンドは、対話的なプロセスを通じてこのファイルを作成します。また、いつでもテキストエディタでこのファイルを手動で変更して設定を調整することもできます。

以下は `config.yaml` ファイルの例で、各セクションを説明するコメントが付いています。

```yaml Example config.yaml icon=logos:yaml
# ドキュメント公開のためのプロジェクト情報
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmithは、AIGNEフレームワーク上に構築された強力なAI駆動のドキュメント生成ツールです。ソースコードから直接、詳細で構造化された多言語のドキュメント作成を自動化します。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# ドキュメント設定
# =============================================================================

# 目的: 読者に達成してもらいたい主な成果は何ですか？
# 利用可能なオプション（必要に応じてコメントを解除し、変更してください）：
#   getStarted       - 迅速な開始：新規ユーザーが30分未満でゼロから作業を開始できるように支援します
#   completeTasks    - 特定のタスクの完了：一般的なワークフローとユースケースを通じてユーザーをガイドします
#   findAnswers      - 迅速な回答の検索：すべての機能とAPIに対して検索可能なリファレンスを提供します
#   understandSystem - システムの理解：システムの仕組み、設計上の決定理由を説明します
#   solveProblems    - 問題の解決：ユーザーのトラブルシューティングと問題修正を支援します
#   mixedPurpose     - 上記の混合：複数のニーズをカバーする包括的なドキュメント
documentPurpose:
  - getStarted
  - completeTasks

# 対象読者: 主に誰がこれを読みますか？
# 利用可能なオプション（必要に応じてコメントを解除し、変更してください）：
#   endUsers         - エンドユーザー（非技術者）：製品を使用するがコーディングはしない人々
#   developers       - 統合開発者：これを自分のプロジェクトに追加するエンジニア
#   devops           - DevOps/インフラストラクチャ：システムをデプロイ、監視、維持するチーム
#   decisionMakers   - 技術的な意思決定者：実装を評価または計画するアーキテクト、リーダー
#   supportTeams     - サポートチーム：他者が製品を使用するのを助ける人々
#   mixedTechnical   - 混合技術者層：開発者、DevOps、および技術ユーザー
targetAudienceTypes:
  - endUsers

# 読者の知識レベル: 読者が訪れたときに通常何を知っていますか？
# 利用可能なオプション（必要に応じてコメントを解除し、変更してください）：
#   completeBeginners    - 完全な初心者：この分野/技術に全く新しい人々
#   domainFamiliar       - 分野に精通、ツールは初めて：問題領域は知っているが、この特定のソリューションは初めて
#   experiencedUsers     - 経験豊富なユーザー：リファレンス/高度なトピックを必要とする通常のユーザー
#   emergencyTroubleshooting - 緊急/トラブルシューティング：何かが壊れており、迅速に修正する必要がある
#   exploringEvaluating  - 探索/評価：これが自分のニーズに合うかどうかを理解しようとしている
readerKnowledgeLevel: completeBeginners

# ドキュメントの深さ: ドキュメントはどの程度包括的であるべきですか？
# 利用可能なオプション（必要に応じてコメントを解除し、変更してください）：
#   essentialOnly      - 必須事項のみ：80%のユースケースをカバーし、簡潔に保つ
#   balancedCoverage   - バランスの取れたカバレッジ：実践的な例を伴う適切な深さ [推奨]
#   comprehensive      - 包括的：すべての機能、エッジケース、および高度なシナリオをカバーする
#   aiDecide           - AIに決定させる：コードの複雑さを分析し、適切な深さを提案する
documentationDepth: comprehensive

# カスタムルール: 特定のドキュメント生成ルールと要件を定義します
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# 対象読者: 特定の対象読者とその特徴を記述します
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: ./docs  # 生成されたドキュメントを保存するディレクトリ
sourcesPath:  # 分析するソースコードのパス
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./media.md
  - ./.aigne/doc-smith/config.yaml
```

## まとめ

設定が完了すると、ツールはプロジェクト、対象読者、ドキュメントの目標を明確に理解し、より正確で関連性の高いコンテンツが生成されます。

プロジェクトの設定を開始するには、[初期設定](./configuration-initial-setup.md) ガイドに進んでください。