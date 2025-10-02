# 設定ガイド

AIGNE DocSmithの動作は、中央設定ファイル`.aigne/doc-smith/config.yaml`によって制御されます。このファイルを使用すると、ドキュメントのスタイル、対象読者、言語、構造を特定のニーズに合わせてカスタマイズできます。

`aigne doc init`を実行して、対話式セットアップウィザードを使用してこのファイルを作成および管理できます。ステップバイステップのウォークスルーについては、[対話式セットアップ](./configuration-interactive-setup.md)ガイドを参照してください。あるいは、より詳細な制御のためにファイルを直接編集することもできます。

以下の図は、設定のワークフローを示しています。

```d2 設定ワークフロー
direction: down

ユーザー: {
  shape: c4-person
}

CLI: {
  label: "`aigne doc init`\n(対話式セットアップ)"
  shape: rectangle
}

ConfigFile: {
  label: ".aigne/doc-smith/config.yaml"
  shape: rectangle
  
  プロジェクト情報: {
    label: "プロジェクト情報"
    shape: rectangle
  }
  
  ドキュメント戦略: {
    label: "ドキュメント戦略"
    shape: rectangle
  }
  
  カスタムディレクティブ: {
    label: "カスタムディレクティブ"
    shape: rectangle
  }
  
  言語とパスの設定: {
    label: "言語とパスの設定"
    shape: rectangle
  }
}

AIGNE-DocSmith: {
  label: "AIGNE DocSmith\n(生成プロセス)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

生成されたドキュメント: {
  label: "生成されたドキュメント"
  shape: rectangle
}

ユーザー -> CLI: "実行"
CLI -> ConfigFile: "作成/変更"
ユーザー -> ConfigFile: "直接編集"
ConfigFile -> AIGNE-DocSmith: "制御"
AIGNE-DocSmith -> 生成されたドキュメント: "生成"
```

## 主要な設定エリア

ドキュメントは、いくつかの主要な設定エリアによって形成されます。これらのガイドを参照して、生成プロセスの各側面を微調整する方法を理解してください。

<x-cards data-columns="2">
  <x-card data-title="対話式セットアップ" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    推奨設定や競合検出を含む、ドキュメントプロジェクトの設定を支援するガイド付きウィザードについて学びます。
  </x-card>
  <x-card data-title="LLMセットアップ" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    APIキーが不要な組み込みのAIGNE Hubの使用方法など、さまざまなAIモデルの接続方法をご覧ください。
  </x-card>
  <x-card data-title="言語サポート" data-icon="lucide:languages" data-href="/configuration/language-support">
    サポートされている言語の全リストを確認し、主要言語の設定方法や自動翻訳の有効化について学びます。
  </x-card>
  <x-card data-title="設定の管理" data-icon="lucide:sliders-horizontal" data-href="/configuration/preferences">
    DocSmithがフィードバックを利用して永続的なルールを作成する方法と、CLIを介してそれらを管理する方法を理解します。
  </x-card>
</x-cards>

## パラメータリファレンス

`config.yaml`ファイルには、ドキュメントの出力を制御するいくつかのキーと値のペアが含まれています。以下は、各パラメータの詳細なリファレンスです。

### プロジェクト情報

これらの設定は、プロジェクトに関する基本的なコンテキストを提供し、ドキュメントを公開する際に使用されます。

| パラメータ | 説明 |
|---|---|
| `projectName` | プロジェクトの名前。`package.json`が存在する場合、そこから検出されます。 |
| `projectDesc` | プロジェクトの簡単な説明。`package.json`から検出されます。 |
| `projectLogo` | プロジェクトのロゴ画像へのパスまたはURL。 |

### ドキュメント戦略

これらのパラメータは、生成されるコンテンツのトーン、スタイル、深さを定義します。

#### `documentPurpose`
読者に達成してほしい主な成果を定義します。この設定は、ドキュメント全体の構造と焦点に影響を与えます。

| オプション | 名前 | 説明 |
|---|---|---|
| `getStarted` | すぐに始める | 新規ユーザーが30分未満でゼロから作業を開始できるように支援します。 |
| `completeTasks` | 特定のタスクを完了する | 一般的なワークフローとユースケースを通じてユーザーをガイドします。 |
| `findAnswers` | 素早く答えを見つける | すべての機能とAPIに対して検索可能なリファレンスを提供します。 |
| `understandSystem`| システムを理解する | それがどのように機能し、なぜ設計上の決定がなされたかを説明します。 |
| `solveProblems` | 一般的な問題をトラブルシューティングする | ユーザーが問題をトラブルシューティングし、修正するのを支援します。 |
| `mixedPurpose` | 複数の目的を果たす | 複数のニーズをカバーするドキュメント。 |

#### `targetAudienceTypes`
誰がこのドキュメントを最も頻繁に読むかを定義します。この選択は、ライティングスタイルと例に影響します。

| オプション | 名前 | 説明 |
|---|---|---|
| `endUsers` | エンドユーザー（非技術者） | 製品を使用するがコーディングはしない人々。 |
| `developers` | 製品/APIを統合する開発者 | これを自分のプロジェクトに追加するエンジニア。 |
| `devops` | DevOps / SRE / インフラチーム | システムをデプロイ、監視、維持するチーム。 |
| `decisionMakers`| 技術的な意思決定者 | 実装を評価または計画するアーキテクトやリード。 |
| `supportTeams` | サポートチーム | 他の人が製品を使用するのを助ける人々。 |
| `mixedTechnical`| 混合技術者オーディエンス | 開発者、DevOps、その他の技術ユーザー。 |

#### `readerKnowledgeLevel`
読者が通常、どのような知識を持っているかを定義します。これにより、どれだけの基礎知識が前提とされるかが調整されます。

| オプション | 名前 | 説明 |
|---|---|---|
| `completeBeginners` | 完全な初心者、ゼロから始める | このドメイン/技術に全く新しい。 |
| `domainFamiliar` | 以前に類似のツールを使用したことがある | 問題領域は知っているが、この特定のソリューションは初めて。 |
| `experiencedUsers` | 特定のことをしようとしている専門家 | リファレンスや高度なトピックを必要とする通常のユーザー。 |
| `emergencyTroubleshooting`| 緊急/トラブルシューティング | 何かが壊れており、迅速に修正する必要がある。 |
| `exploringEvaluating` | このツールを他と比較評価している | これが自分のニーズに合うかどうかを理解しようとしている。 |

#### `documentationDepth`
ドキュメントがどの程度包括的であるべきかを定義します。

| オプション | 名前 | 説明 |
|---|---|---|
| `essentialOnly` | 必須事項のみ | 80%のユースケースをカバーし、簡潔に保ちます。 |
| `balancedCoverage`| バランスの取れたカバレッジ | 実践的な例を含む適切な深さ[推奨]。 |
| `comprehensive` | 包括的 | すべての機能、エッジケース、高度なシナリオをカバーします。 |
| `aiDecide` | AIに決定させる | コードの複雑さを分析し、適切な深さを提案します。 |

### カスタムディレクティブ

より詳細な制御のために、自由形式の指示を提供できます。

| パラメータ | 説明 |
|---|---|
| `rules` | 特定のドキュメント生成ルール（例：「常にパフォーマンスベンチマークを含める」）を定義できる複数行の文字列。 |
| `targetAudience`| プリセットで許容されるよりも詳細に特定の対象読者を記述するための複数行の文字列。 |

### 言語とパスの設定

これらの設定は、ローカライゼーションとファイルの場所を制御します。

| パラメータ | 説明 |
|---|---|
| `locale` | ドキュメントの主要言語（例：`en`, `zh`）。 |
| `translateLanguages` | ドキュメントを翻訳する言語コードのリスト（例：`[ja, fr, es]`）。 |
| `docsDir` | 生成されたドキュメントファイルが保存されるディレクトリ。 |
| `sourcesPath` | DocSmithが分析するためのソースコードパスまたはglobパターンのリスト（例：`['./src', './lib/**/*.js']`）。 |
| `glossary` | 一貫した翻訳を保証するために、プロジェクト固有の用語を含むマークダウンファイル（`@glossary.md`）へのパス。 |

## config.yaml の例

これは完全な設定ファイルの例です。このファイルを直接編集して、いつでも設定を変更できます。

```yaml config.yaml の例 icon=logos:yaml
# ドキュメント公開用のプロジェクト情報
projectName: AIGNE DocSmith
projectDesc: An AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# ドキュメント設定
# =============================================================================

# 目的：読者に達成してほしい主な成果は何か？
# オプション：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - completeTasks
  - findAnswers

# 対象読者：誰がこれを最も頻繁に読むか？
# オプション：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - developers

# 読者の知識レベル：読者は通常、どのような知識を持っているか？
# オプション：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: domainFamiliar

# ドキュメントの深さ：ドキュメントはどの程度包括的であるべきか？
# オプション：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: balancedCoverage

# カスタムルール：特定のドキュメント生成ルールと要件を定義する
rules: |+
  

# 対象読者：特定の対象読者とその特性を記述する
targetAudience: |+
  

# 用語集：プロジェクト固有の用語と定義を含むマークダウンファイルへのパス
# glossary: "@glossary.md"

# ドキュメントの主要言語
locale: en

# ドキュメントを翻訳する言語のリスト
# translateLanguages:
#   - zh
#   - fr

# 生成されたドキュメントを保存するディレクトリ
docsDir: .aigne/doc-smith/docs

# 分析するソースコードパス
sourcesPath:
  - ./
```

設定が完了したら、プロジェクトのニーズに合ったドキュメントを作成する準備ができました。次のステップは、生成コマンドを実行することです。

➡️ **次へ：** [ドキュメントの生成](./features-generate-documentation.md)