# 対話型セットアップ

AIGNE DocSmithには、プロジェクト設定を効率化するための対話型セットアップウィザードが含まれており、`aigne doc init`コマンドで起動します。このガイド付きプロセスでは、ドキュメントの目標に関する一連の質問が行われ、その回答から`config.yaml`ファイルが生成されます。これは、設定エラーを防ぎ、入力に基づいて具体的な推奨事項を提供するため、新しいドキュメントプロジェクトを開始する際に推奨される方法です。

## ウィザードの実行

プロセスを開始するには、プロジェクトのルートディレクトリで次のコマンドを実行します。

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

ウィザードは、ドキュメントを設定するための8ステップのプロセスを案内します。

## ガイド付きプロセス

ウィザードは、以下の主要な設定詳細を尋ねます。

1.  **主な目標**: 読者の主な目的を定義します（例：入門、回答の検索）。
2.  **対象読者**: ドキュメントの主な読者を指定します（例：非技術的なエンドユーザー、開発者）。
3.  **読者の知識レベル**: 対象読者の典型的な初期知識を評価します。
4.  **ドキュメントの深さ**: コンテンツの詳細レベルと範囲を決定します。
5.  **主な言語**: ドキュメントの主要言語を設定します。
6.  **翻訳言語**: 翻訳のための追加言語を選択します。
7.  **出力ディレクトリ**: 生成されたドキュメントファイルの場所を指定します。
8.  **ソースコードのパス**: globパターンをサポートし、分析対象のファイルとディレクトリを定義します。

## 設定支援

ウィザードは、一貫性のある効果的な設定を作成するために、事前定義された一連のルールを使用します。

```d2
direction: down

User-Selections: {
  label: "1. User provides input\n(Purpose, Audience, etc.)"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. Wizard's Rule Engine"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "Option Filtering\n(Prevents incompatible selections)"
  }

  Conflict-Detection: {
    label: "Conflict Detection\n(Identifies complex needs)"
  }
}

Guided-Experience: {
  label: "3. Guided Experience"
  shape: rectangle
  content: "User sees simplified, relevant options"
}

Final-Config: {
  label: "4. Final Configuration"
  content: "config.yaml is generated with\nconflict resolution strategies"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "Refines"
```

### デフォルトの提案とオプションのフィルタリング

選択を行うと、ウィザードはデフォルトを提供し、後続のオプションをフィルタリングして、論理的な設定に導きます。これは、質問間の競合ルールセットに基づいています。

-   **デフォルトの提案**: 主な目標として「すぐに始める」を選択すると、ウィザードは読者の知識レベルとして「完全な初心者」を推奨します。
-   **リアルタイムフィルタリング**: 対象読者が「エンドユーザー（非技術的）」の場合、ウィザードは「専門家」の知識レベルを非表示にします。このルールの理由は、非技術的なユーザーは通常、経験豊富な技術ユーザーではないため、互換性のない選択を防ぐためです。

### 競合の検出と解決

場合によっては、非技術的な**エンドユーザー**と専門家の**開発者**の両方向けにドキュメントを作成するなど、効果的なドキュメント構造を必要とする複数の目標や対象者がいることがあります。ウィザードはこれらを「解決可能な競合」として識別します。

次に、これらのニーズにドキュメント構造内で対応するための戦略を策定します。エンドユーザー対開発者の例では、解決戦略として別々のユーザーパスを作成します。

-   **ユーザーガイドパス**: 平易な言葉を使用し、UIの操作に焦点を当て、ビジネスの成果を志向します。
-   **開発者ガイドパス**: コード中心で技術的に正確であり、SDKの例や設定スニペットを含みます。

このアプローチにより、最終的なドキュメントは、単一の混乱したコンテンツの混合物を作成するのではなく、複数の対象者に効果的に対応できるように構成されます。

## 生成される出力

ウィザードを完了すると、プロジェクトに`config.yaml`ファイルが保存されます。このファイルは完全にコメント化されており、各オプションを説明し、利用可能なすべての選択肢をリストアップしているため、後で手動で確認・修正するのが簡単です。

以下は生成されたファイルのスニペットです。

```yaml config.yaml icon=logos:yaml
# ドキュメント公開のためのプロジェクト情報
projectName: your-project-name
projectDesc: Your project description.
projectLogo: ""

# =============================================================================
# ドキュメント設定
# =============================================================================

# 目的: 読者に達成してほしい主な成果は何ですか？
# 利用可能なオプション（必要に応じてコメントを解除して変更してください）：
#   getStarted       - すぐに始める：新規ユーザーが30分以内にゼロから作業を開始できるように支援します
#   completeTasks    - 特定のタスクを完了する：一般的なワークフローやユースケースをユーザーに案内します
documentPurpose:
  - completeTasks
  - findAnswers

# 対象読者: これを最も頻繁に読むのは誰ですか？
# 利用可能なオプション（必要に応じてコメントを解除して変更してください）：
#   endUsers         - エンドユーザー（非技術的）：製品を使用するがコーディングはしない人々
#   developers       - 開発者（製品/APIを統合）：これを自分のプロジェクトに追加するエンジニア
targetAudienceTypes:
  - endUsers
  - developers

# ... その他の設定
```

## 次のステップ

設定ファイルが準備できたので、ドキュメントの生成、翻訳、または公開を行う準備が整いました。

<x-cards>
  <x-card data-title="ドキュメントの生成" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    単一のコマンドを使用して、ソースコードから完全なドキュメントセットを自動的に作成する方法を学びます。
  </x-card>
  <x-card data-title="設定ガイド" data-icon="lucide:settings" data-href="/configuration">
    利用可能なすべての設定を深く掘り下げ、`config.yaml`ファイルを手動で微調整する方法を学びます。
  </x-card>
</x-cards>