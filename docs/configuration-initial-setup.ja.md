# 初期設定

このガイドでは、AIGNE DocSmith の対話式セットアッププロセスをステップバイステップで説明します。この手順は `aigne doc create` を初めて実行する際に自動的に実行されますが、手動で開始することも可能です。目的は、ドキュメント生成のための設定を保存する `config.yaml` ファイルを作成することです。

## セットアッププロセスの開始方法

手動で設定を開始するには、ターミナルでプロジェクトのルートディレクトリに移動し、以下のコマンドを実行します。

```sh aigne doc init icon=lucide:terminal
aigne doc init
```

このコマンドは、ドキュメント設定を構成するための 9 ステップの対話式アンケートを開始します。

## 設定手順

セットアッププロセスでは、一連の質問が表示されます。以下のセクションで各ステップを詳しく説明します。

### ステップ 1: ドキュメントの目的を定義する

最初のステップは、ドキュメントの主要な目標を設定することです。この選択は、生成されるコンテンツのトーン、構造、および焦点に影響を与えます。

**プロンプト:** `📝 [1/9]: What should your documentation help readers achieve?`

以下のリストから 1 つまたは複数のオプションを選択できます。

| オプション | 名前 | 説明 |
| :----------------- | :------------------------ | :----------------------------------------------------------- |
| `getStarted` | すぐに始める | 新規ユーザーが 30 分以内にゼロから作業を開始できるように支援します。 |
| `completeTasks` | 特定のタスクを完了する | 一般的なワークフローやユースケースを通じてユーザーをガイドします。 |
| `findAnswers` | 素早く答えを見つける | すべての機能と API について検索可能なリファレンスを提供します。 |
| `understandSystem` | システムを理解する | システムの仕組みと設計決定の背景にある理由を説明します。 |
| `solveProblems` | 問題を解決する | ユーザーが問題をトラブルシューティングし、修正するのを支援します。 |
| `mixedPurpose` | 上記の組み合わせ | 複数のニーズを包括的にカバーします。 |

### ステップ 2: 対象読者を特定する

次に、ドキュメントの主な読者を指定します。これにより、言語と技術的な深さを適切なレベルに調整するのに役立ちます。

**プロンプト:** `👥 [2/9]: Who will be reading your documentation?`

このリストから複数の読者を選択できます。

| オプション | 名前 | 説明 |
| :--------------- | :------------------------- | :----------------------------------------------------------- |
| `endUsers` | エンドユーザー（非技術者） | 製品を使用するが、コードは書かない人々。 |
| `developers` | 統合開発者 | 製品を自分たちのプロジェクトに追加するエンジニア。 |
| `devops` | DevOps/インフラストラクチャ | システムのデプロイ、監視、保守を行うチーム。 |
| `decisionMakers` | 技術的な意思決定者 | 実装のために技術を評価するアーキテクトやリード。 |
| `supportTeams` | サポートチーム | 他の人が製品を使用するのを助ける人々。 |
| `mixedTechnical` | 混合技術者 | 開発者、DevOps、その他の技術ユーザーの組み合わせ。 |

### ステップ 3: 読者の知識レベルを指定する

読者の想定される知識レベルを示します。これにより、コンテンツが効果的に提示され、基本的すぎる情報や複雑すぎる情報を避けることができます。

**プロンプト:** `🧠 [3/9]: How much do your readers already know about your project?`

読者を最もよく表すオプションを選択してください。

| オプション | 名前 | 説明 |
| :------------------------- | :--------------------------- | :----------------------------------------------------------------- |
| `completeBeginners` | 完全な初心者 | ドメインや技術に全く慣れていない人々。 |
| `domainFamiliar` | ドメインには詳しいが、ツールは初めて | 問題領域は知っているが、この特定のソリューションは初めての人々。 |
| `experiencedUsers` | 経験豊富なユーザー | リファレンス資料や高度なトピックを必要とする通常のユーザー。 |
| `emergencyTroubleshooting` | 緊急/トラブルシューティング | 問題に遭遇し、迅速に修正する必要があるユーザー。 |
| `exploringEvaluating` | 探索/評価中 | ツールが自分たちのニーズに合うかどうかを判断しようとしているユーザー。 |

### ステップ 4: ドキュメントの詳細度を設定する

ドキュメントをどの程度詳細にするかを選択します。このパラメータは、生成されるコンテンツの範囲と詳細レベルを決定します。

**プロンプト:** `📊 [4/9]: How detailed should your documentation be?`

以下のレベルから 1 つを選択してください。

| オプション | 名前 | 説明 |
| :----------------- | :------------------- | :------------------------------------------------------------------- |
| `essentialOnly` | 必須事項のみ | 最も一般的なユースケースの 80% を簡潔にカバーします。 |
| `balancedCoverage` | バランスの取れた網羅性 | 実用的な例とともに、適切な深さを提供します。 |
| `comprehensive` | 包括的 | すべての機能、エッジケース、高度なシナリオをカバーします。 |
| `aiDecide` | AI に決定させる | ツールがコードの複雑さを分析し、適切な深さを提案します。 |

### ステップ 5: 主要言語を選択する

ドキュメントの主要言語を選択します。システムはオペレーティングシステムの言語を検出し、それをデフォルトとして提案します。

**プロンプト:** `🌐 [5/9]: What is the main language of your documentation?`

英語、中国語（簡体字）、スペイン語など、サポートされている 12 の言語リストから選択できます。

### ステップ 6: 翻訳言語を選択する

ドキュメントを翻訳したい追加の言語を選択します。

**プロンプト:** `🔄 [6/9]: What languages should we translate to?`

前のステップで選択した主要言語を除く、サポートされているオプションから複数の言語を選択できます。

### ステップ 7: ドキュメントのディレクトリを定義する

生成されたドキュメントファイルを保存するフォルダを指定します。

**プロンプト:** `📁 [7/9]: Where should we save your documentation?`

デフォルトのパスは `.aigne/doc-smith/docs` です。このデフォルトを受け入れるか、別のパスを指定することができます。

### ステップ 8: コンテンツソースを指定する

ドキュメントを生成するためにツールが分析すべきファイル、フォルダ、または URL を示します。複数のパスを追加したり、glob パターンを使用してより具体的なファイルを指定したりできます。

**プロンプト:** `🔍 [8/9]: Data Sources`

ファイルパス（例: `./src`）、glob パターン（例: `src/**/*.js`）、または URL（例: `https://example.com/openapi.yaml`）の入力を求められます。パスが指定されない場合、ツールはデフォルトでプロジェクトディレクトリ全体を分析します。

### ステップ 9: カスタムルールを提供する

このオプションのステップでは、AI がコンテンツ生成中に従うべき特定の指示や制約を提供できます。

**プロンプト:** `📋 [9/9]: Do you have any custom rules or requirements for your documentation? (Optional, press Enter to skip)`

トーン、スタイル、または除外するコンテンツなど、あらゆる要件を入力できます。例：「技術的な正確さに重点を置き、マーケティング用語は避けてください。」

## `config.yaml` ファイル

すべての質問に答えると、DocSmith は回答を `config.yaml` という名前の設定ファイルに保存します。このファイルはプロジェクトの `.aigne/doc-smith/` ディレクトリに配置されます。このファイルは、将来のすべてのドキュメント生成の設計図として機能し、いつでも手動で編集できます。

以下は、生成された `config.yaml` ファイルの例です。

```yaml config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation creation tool...
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# AI Thinking Configuration
thinking:
  effort: standard

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: comprehensive

# Custom Rules: Define specific documentation creation rules and requirements
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details...

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |

# Language settings
locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja

# Paths
docsDir: ./docs  # The directory where the created documents will be saved.
sourcesPath:  # The source code paths to analyze.
  - ./README.md
  - ./agents

# Image filtering settings
media:
  minImageWidth: 800
```

## まとめと次のステップ

セットアップが完了すると、新しい設定ファイルへのパスを示す確認メッセージが表示されます。

![Setup Complete](../assets/screenshots/doc-complete-setup.png)

初期設定が保存されたので、ドキュメントを作成する準備が整いました。

<x-cards data-columns="2">
  <x-card data-title="ドキュメント生成" data-href="/guides/generating-documentation" data-icon="lucide:file-text">
    生成プロセスを実行して最初のドキュメントセットを作成する方法を学びます。
  </x-card>
  <x-card data-title="設定の管理" data-href="/configuration/managing-preferences" data-icon="lucide:settings">
    保存した設定をいつでも表示および変更する方法を確認します。
  </x-card>
</x-cards>
