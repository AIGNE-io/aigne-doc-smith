# 設定リファレンス

`config.yaml`ファイルは、ドキュメント生成のコアコントロールパネルです。その設定を調整することで、ドキュメントの構造、コンテンツのスタイル、言語サポートなど、AIがドキュメントを生成する方法を制御できます。このガイドでは、プロジェクトのニーズに合わせて微調整できるよう、各設定フィールドについて詳しく説明します。

## 概要

`config.yaml`ファイルは、AIGNE DocSmithの主要な設定ファイルです。すべての設定パラメータをYAML形式で保存します。`create`、`update`、`translate`などのコマンドを実行すると、DocSmithはこのファイルを読み取って設定要件を理解します。

- **ファイル名:** `config.yaml`
- **場所:** `.aigne/doc-smith/config.yaml` (プロジェクトルートからの相対パス)
- **フォーマット:** YAML (UTF-8)

このファイルを通じて、ドキュメントの目標、対象読者、コンテンツ生成ルール、ドキュメント構造、多言語サポート、公開設定などを設定できます。

### 設定の作成と更新

`config.yaml`ファイルは、DocSmithを初めて使用する際に自動的に作成されます。

**作成:**

このファイルは2つの方法で作成できます。

1.  **初回生成時:** 新しいプロジェクトで`aigne doc create`を実行すると、対話型ウィザードが起動し、生成プロセスを開始する前に`config.yaml`ファイルを作成します。
2.  **個別に作成:** `aigne doc init`を実行すると、同じウィザードが起動し、ドキュメントをすぐに生成することなく設定ファイルを作成します。

```sh aigne doc init icon=lucide:terminal
aigne doc init
```

**更新:**

次のいずれかの方法で設定を更新できます。

1.  **ファイルを直接編集:** テキストエディタで`.aigne/doc-smith/config.yaml`を開き、フィールドを変更します。
2.  **対話型ウィザードを使用:** `aigne doc init`を再度実行します。ウィザードは既存の設定を読み込み、更新をガイドします。

## 設定パラメータ

`config.yaml`のフィールドは機能グループごとに整理されています。以下のセクションでは、各パラメータについて詳しく説明します。

### プロジェクトの基本情報

これらのフィールドは、ドキュメントのブランディング、検索エンジン最適化、ソーシャルメディア共有に使用される基本的なプロジェクト情報を定義します。

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの表示名。ドキュメントのタイトル、ナビゲーションバー、その他のブランディング要素に表示されます。様々なインターフェースで完全に表示されるように、50文字以内にすることをお勧めします。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの簡単な説明。検索エンジン最適化やソーシャル共有のプレビューテキストに使用されます。プロジェクトのコアバリューを明確かつ簡潔に説明するため、150文字以内にすることをお勧めします。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>プロジェクトロゴのURLまたはローカルファイルパス。ロゴはドキュメントウェブサイトのヘッダー、ブラウザのタブアイコン、ソーシャルメディア共有のプレビューに表示されます。完全なURL（例: `https://example.com/logo.png`）または相対パス（例: `./assets/logo.png`）をサポートします。</x-field-desc>
  </x-field>
</x-field-group>

### AI思考設定

これらの設定は、ドキュメントコンテンツを生成する際のAIの思考の深さと処理強度を制御し、生成品質と速度のバランスに影響を与えます。

<x-field-group>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>AIの推論強度を設定します。</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>AIの思考強度を制御します。オプション：`lite`（高速モード、単純なドキュメントに適しています）、`standard`（標準モード、ほとんどのシナリオで推奨）、`pro`（ディープモード、複雑なドキュメントに適していますが、生成時間が長くなります）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### ドキュメンテーション戦略

これらの設定は、ドキュメントの目標、読者のタイプ、コンテンツの深さなど、ドキュメント生成戦略を定義し、AIがコンテンツを整理・生成する方法に直接影響します。

<x-field-group>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>ドキュメントの主な目標を定義します（複数選択可）。オプションには、`getStarted`（クイックスタートガイド）、`completeTasks`（タスク操作マニュアル）、`findAnswers`（リファレンス検索マニュアル）、`understandSystem`（システム理解ドキュメント）、`solveProblems`（トラブルシューティングガイド）、`mixedPurpose`（総合ドキュメント）があります。異なる目標を選択すると、ドキュメントの構造とコンテンツの構成に影響します。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>対象読者のタイプを指定します（複数選択可）。オプションには、`endUsers`（一般ユーザー）、`developers`（開発者）、`devops`（運用エンジニア）、`decisionMakers`（技術意思決定者）、`supportTeams`（技術サポートチーム）、`mixedTechnical`（混合技術背景）があります。異なる読者タイプを選択すると、ドキュメントの言語スタイル、技術的な深さ、例のタイプに影響します。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>対象読者の技術知識レベルを設定します。オプションには、`completeBeginners`（完全な初心者、詳細な説明が必要）、`domainFamiliar`（関連ドメインには詳しいがこのツールは初めてのユーザー）、`experiencedUsers`（経験豊富なユーザー、リファレンスマニュアルが必要）、`emergencyTroubleshooting`（緊急トラブルシューティング、迅速な解決策が必要）、`exploringEvaluating`（適合性を評価中、迅速な理解が必要）があります。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>ドキュメントの詳細度を制御します。オプションには、`essentialOnly`（コア機能のみ、簡潔なバージョン）、`balancedCoverage`（バランスの取れたカバレッジ、ほとんどのプロジェクトで推奨）、`comprehensive`（包括的なカバレッジ、すべての機能とエッジケースを含む）、`aiDecide`（コードの複雑さに応じてAIが自動的に決定）があります。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudience" data-type="string" data-required="false">
    <x-field-desc markdown>`targetAudienceTypes`設定を補足するための対象読者の詳細な説明。読者の特定の背景、使用例、技術スタック、または特別な要件を記述できます。複数行のテキストをサポートし、AIが読者のニーズをよりよく理解するのに役立ちます。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>コンテンツの構造、ライティングスタイル、フォーマット要件など、AIに対する詳細な生成ルールとガイダンスを提供します。これは最も重要な設定フィールドの1つであり、生成されるドキュメントの品質とスタイルに直接影響します。Markdown形式をサポートし、複数行のルールを記述できます。「曖昧な言葉を使わない」、「コード例を必ず含める」など、具体的な要件を詳細に指定することをお勧めします。</x-field-desc>
  </x-field>
</x-field-group>

### 言語

プライマリ言語と翻訳用の追加言語を設定します。

<x-field-group>
  <x-field data-name="locale" data-type="string" data-default="en" data-required="false">
    <x-field-desc markdown>ドキュメントのプライマリ言語で、標準の言語コードを使用します。一般的な値には、`en`（英語）、`zh`（簡体字中国語）、`zh-TW`（繁体字中国語）、`ja`（日本語）などがあります。ドキュメントは最初にこの言語で生成され、その後他の言語に翻訳できます。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>翻訳対象言語のリスト（複数選択可）。各言語コードに対して、翻訳されたドキュメント一式が生成されます。たとえば、`["zh", "ja"]`と設定すると、ドキュメントの簡体字中国語版と日本語版が生成されます。注意：`locale`と同じ言語コードは含めないでください。</x-field-desc>
  </x-field>
</x-field-group>

### データソース

これらの設定は、AIがソースコードとドキュメントを分析する際に使用する参照資料を指定し、生成されるドキュメントの品質と正確性に直接影響します。

<x-field-group>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>AI分析用のソースコードとドキュメントパスのリスト。**これは最も重要な設定フィールドです**。なぜなら、AIはこれらのパス内のコンテンツに基づいてのみドキュメントを生成するからです。READMEファイル、主要なソースコードディレクトリ、設定ファイル（`package.json`、`aigne.yaml`など）、既存のドキュメントディレクトリなどを含めることをお勧めします。ディレクトリパス（例: `./src`）、ファイルパス（例: `./README.md`）、globパターン（例: `src/**/*.js`）、リモートURLなど、複数の形式をサポートします。</x-field-desc>
  </x-field>
</x-field-group>

### 出力とデプロイ

生成されたドキュメントの保存場所と公開アドレスを設定します。

<x-field-group>
  <x-field data-name="docsDir" data-type="string" data-default="./aigne/doc-smith/docs" data-required="false">
    <x-field-desc markdown>生成されたドキュメントを保存するディレクトリ。すべての生成されたMarkdownファイルがこのディレクトリに保存されます。ディレクトリが存在しない場合、DocSmithは自動的に作成します。プロジェクトの移行を容易にするために、相対パスを使用することをお勧めします。</x-field-desc>
  </x-field>
  <x-field data-name="appUrl" data-type="string" data-required="false">
    <x-field-desc markdown>ドキュメント公開後のアクセスアドレス。`publish`コマンドを実行した後、DocSmithはこのフィールドを自動的に更新します。特定の公開アドレスを指定したい場合を除き、通常は手動で設定する必要はありません。</x-field-desc>
  </x-field>
</x-field-group>

### メディアと表示

これらの設定は、画像などのメディアアセットの処理方法を制御します。

<x-field-group>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>メディアファイルの処理設定。</x-field-desc>
    <x-field data-name="minImageWidth" data-type="integer" data-default="800" data-required="false">
      <x-field-desc markdown>ドキュメントに含める画像の最小幅（ピクセル単位）。この値より幅の広い画像のみが使用され、低品質または小さすぎる画像をフィルタリングするのに役立ちます。推奨値：600〜800ピクセル（品質と量のバランス）、800〜1000ピクセル（高品質要件）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 図表設定

図表生成の動作とAIの労力レベルを制御します。

<x-field-group>
  <x-field data-name="diagramming" data-type="object" data-required="false">
    <x-field-desc markdown>図表生成設定。</x-field-desc>
    <x-field data-name="effort" data-type="integer" data-default="5" data-required="false">
      <x-field-desc markdown>図表を生成する際のAIの労力レベル、範囲は0〜10。値が高いほど生成される図表は少なくなります。推奨設定：0〜3（多くの図表を生成し、豊富な視覚的説明が必要なドキュメントに適しています）、4〜6（バランスモード、推奨）、7〜10（少数の図表を生成し、テキストコンテンツに重点を置きます）。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### システム管理フィールド

これらのフィールドはDocSmithによって自動的に管理されるため、通常は手動で編集する必要はありません。これらのフィールドを変更すると、予期しない問題が発生する可能性があります。

<x-field-group>
  <x-field data-name="lastGitHead" data-type="string" data-required="false">
    <x-field-desc markdown>最後のドキュメント生成時のGitコミットハッシュ。DocSmithはこの値を使用してどのファイルが変更されたかを判断し、差分更新を可能にします。**手動で変更しないでください**。</x-field-desc>
  </x-field>
  <x-field data-name="boardId" data-type="string" data-required="false">
    <x-field-desc markdown>ドキュメント公開ボードの一意の識別子で、システムによって自動的に生成されます。**手動で変更しないでください**。変更すると、プロジェクトと公開履歴の接続が切断され、公開されたドキュメントが失われる可能性があります。</x-field-desc>
  </x-field>
  <x-field data-name="checkoutId" data-type="string" data-required="false">
    <x-field-desc markdown>ドキュメントのデプロイ中に使用される一時的な識別子で、システムによって自動的に管理されます。**手動で変更しないでください**。</x-field-desc>
  </x-field>
  <x-field data-name="shouldSyncBranding" data-type="string" data-required="false">
    <x-field-desc markdown>ブランディングを同期するかどうかを制御する一時的な変数で、システムによって自動的に管理されます。**手動で変更しないでください**。</x-field-desc>
  </x-field>
</x-field-group>

## 変更の適用

`config.yaml`ファイルを変更した後、変更を有効にするには対応するコマンドを実行する必要があります。フィールドによって必要なコマンドが異なります。詳細は以下の表を参照してください。

| Field | 変更を適用するコマンド | 説明 |
| :-------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------ |
| `documentPurpose`, `targetAudienceTypes`, `readerKnowledgeLevel`, `documentationDepth`, `locale` | `aigne doc clear && aigne doc create` | これらのフィールドはドキュメント全体の構造に影響するため、古いドキュメントをクリアして再生成する必要があります。 |
| `rules`, `targetAudience`, `media.minImageWidth`, `thinking.effort`, `diagramming.effort` | `aigne doc update` | これらのフィールドはコンテンツ生成方法にのみ影響するため、再生成せずに既存のドキュメントを直接更新できます。 |
| `sourcesPath` | `aigne doc clear && aigne doc create` または `aigne doc update` | 新しいデータソースを追加した後、完全な再生成または差分更新を選択できます。初回追加時は`create`を使用し、その後の追加では`update`を使用することをお勧めします。 |
| `translateLanguages` | `aigne doc translate` | 新しい翻訳言語を追加した後、このコマンドを実行して対応する言語版のドキュメントを生成します。 |
| `projectName`, `projectDesc`, `projectLogo`, `appUrl` | `aigne doc publish` | これらのフィールドは主に公開時のメタデータに使用されます。変更後、再公開すると有効になります。 |
| `docsDir` | `aigne doc create` | 出力ディレクトリを変更した後、次回のドキュメント生成は新しいディレクトリに保存されます。 |

## 完全な設定例

以下は、AIGNE DocSmithプロジェクト自体の完全な`config.yaml`ファイルで、実際の構成例を示しています。

```yaml config.yaml
# ドキュメント公開のためのプロジェクト情報
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation creation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# ドキュメント設定
# =============================================================================

# 目的：読者に達成してもらいたい主な成果は何か？
documentPurpose:
  - getStarted
  - completeTasks

# 対象読者：誰がこれを最も頻繁に読むか？
targetAudienceTypes:
  - endUsers

# 読者の知識レベル：読者がここに来たとき、通常何を知っているか？
readerKnowledgeLevel: completeBeginners

# ドキュメントの深さ：ドキュメントはどの程度包括的であるべきか？
documentationDepth: comprehensive

# カスタムルール：特定のドキュメント生成ルールと要件を定義する
rules: |
  'intelligently'、'seamlessly'、'comprehensive'、'high-quality'など、測定可能または具体的な詳細を提供しない曖昧または空虚な言葉の使用は避けてください。具体的で検証可能な事実に焦点を当ててください。
  具体的で検証可能な事実に焦点を当ててください。
  DocSmithのすべてのサブコマンドを網羅する必要があります

# 対象読者：特定の対象読者とその特徴を記述する
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: .aigne/doc-smith/docs
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml
  - ./assets/screenshots
lastGitHead: d9d2584f23aee352485f369f60142949db601283
# ⚠️ 警告：boardIdはシステムによって自動生成されます。手動で編集しないでください
boardId: "docsmith"
appUrl: https://docsmith.aigne.io
# ドキュメントデプロイメントサービス用のチェックアウトID
checkoutId: ""

diagramming:
  effort: 5 # 図表作成のためのAIの労力レベル、0-10、大きいほど図が少なくなる
# AI思考設定
# thinking.effort: AIが応答する際の推論と認知努力の深さを決定します。利用可能なオプション：
#   - lite: 基本的な推論による高速応答
#   - standard: 速度と推論能力のバランスが取れている
#   - pro: 応答時間が長い詳細な推論
thinking:
  effort: standard
# ドキュメントのブランディングを同期する必要があります
shouldSyncBranding: ""
```

## まとめ

`config.yaml`ファイルは、ドキュメント生成を制御する中心です。プロジェクト情報、ドキュメンテーション戦略、データソースを適切に設定することで、AIを導き、プロジェクトのニーズに合った高品質なドキュメントを生成できます。基本的な設定から始め、実際の結果に基づいて徐々にパラメータを調整することをお勧めします。
