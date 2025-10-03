# インタラクティブなセットアップ

AIGNE DocSmithには、`aigne doc init`コマンドで起動するインタラクティブなセットアップウィザードが含まれており、プロジェクトの設定を効率化します。このガイド付きプロセスでは、ドキュメントの目標に関する一連の質問が行われ、回答に基づいて`config.yaml`ファイルが生成されます。設定エラーを防ぎ、入力に基づいて具体的な推奨事項を提供するため、新しいドキュメントプロジェクトを開始する際に推奨される方法です。

## ウィザードの実行

プロセスを開始するには、プロジェクトのルートディレクトリで次のコマンドを実行します。

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

ウィザードが8つのステップでドキュメントの設定を案内します。

## ガイド付きプロセス

ウィザードでは、以下の主要な設定項目についてプロンプトが表示されます。

1.  **プライマリゴール**: 読者の主な目的を定義します（例：利用開始、回答の検索）。
2.  **ターゲットオーディエンス**: ドキュメントの主な読者を指定します（例：非技術系のエンドユーザー、開発者）。
3.  **読者の知識レベル**: 読者の一般的な初期知識を評価します。
4.  **ドキュメントの深さ**: コンテンツの詳細レベルと範囲を決定します。
5.  **プライマリ言語**: ドキュメントの主要言語を設定します。
6.  **翻訳言語**: 翻訳用の追加言語を選択します。
7.  **出力ディレクトリ**: 生成されたドキュメントファイルの場所を指定します。
8.  **ソースコードパス**: globパターンをサポートし、分析するファイルとディレクトリを定義します。

## アシスト付き設定

ウィザードは、一貫性のある効果的な設定を作成するために、事前定義された一連のルールを使用します。

```d2
direction: down

User-Selections: {
  label: "1. ユーザーが入力\n(目的、オーディエンスなど)"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. ウィザードのルールエンジン"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "オプションフィルタリング\n(互換性のない選択を防止)"
  }

  Conflict-Detection: {
    label: "競合検出\n(複雑なニーズを特定)"
  }
}

Guided-Experience: {
  label: "3. ガイド付きエクスペリエンス"
  shape: rectangle
  content: "ユーザーには簡素化された関連オプションが表示される"
}

Final-Config: {
  label: "4. 最終設定"
  content: "config.yamlが競合解決戦略とともに生成される"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "絞り込み"
```

### オプションフィルタリング

選択を行うと、ウィザードは後続のオプションをフィルタリングして、論理的な設定に導きます。これは、互換性のない選択を防ぐための一連の質問間競合ルールに基づいています。

たとえば、ターゲットオーディエンスとして「エンドユーザー（非技術者）」を選択した場合、ウィザードは知識レベルの選択肢である「専門家である」を非表示にします。このルールの理由は、「非技術系のユーザーは通常、経験豊富な技術ユーザーではない」ということであり、非論理的な選択を防ぎます。

### 競合の検出と解決

場合によっては、非技術系の**エンドユーザー**と専門家の**開発者**の両方向けにドキュメントを作成するなど、効果的なドキュメント構造を必要とする複数の目標やオーディエンスが存在することがあります。ウィザードはこれらを「解決可能な競合」として識別します。

そして、これらのニーズにドキュメント構造内で対応するための戦略を策定します。エンドユーザー対開発者の例では、解決戦略として別々のユーザーパスを作成します。

-   **ユーザーガイドパス**: 平易な言葉を使用し、UIの操作に焦点を当て、ビジネス成果を志向します。
-   **開発者ガイドパス**: コード中心で技術的に正確であり、SDKの例や設定スニペットを含みます。

このアプローチにより、最終的なドキュメントは、単一の混乱したコンテンツの混合物を作成するのではなく、複数のオーディエンスに効果的に対応できるように構成されます。

## 生成される出力

ウィザードを完了すると、プロジェクトに`config.yaml`ファイルが保存されます。このファイルは完全にコメント化されており、各オプションの説明と利用可能なすべての選択肢がリストされているため、後で手動で確認したり変更したりするのが簡単です。

以下は生成されたファイルのスニペットです。

```yaml config.yaml icon=logos:yaml
# ドキュメント公開用のプロジェクト情報
projectName: your-project-name
projectDesc: Your project description.
projectLogo: ""

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options (uncomment and modify as needed):
#   getStarted       - すぐに始める: 新規ユーザーが30分未満でゼロから作業を開始できるように支援
#   completeTasks    - 特定のタスクを完了する: 一般的なワークフローやユースケースをユーザーに案内
documentPurpose:
  - completeTasks
  - findAnswers

# Target Audience: Who will be reading this most often?
# Available options (uncomment and modify as needed):
#   endUsers         - エンドユーザー (非技術者): 製品を使用するがコーディングはしない人々
#   developers       - 開発者 (製品/APIを統合): これを自分のプロジェクトに追加するエンジニア
targetAudienceTypes:
  - endUsers
  - developers

# ... その他の設定
```

完了すると、ターミナルに確認メッセージが表示されます。

![インタラクティブなセットアップウィザードが正常に完了したことを示すターミナルウィンドウ。](../assets/screenshots/doc-complete-setup.png)

## 次のステップ

設定ファイルが準備できたので、ドキュメントを生成、翻訳、または公開する準備が整いました。

<x-cards>
  <x-card data-title="ドキュメントの生成" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    単一のコマンドを使用してソースコードから完全なドキュメントセットを自動的に作成する方法を学びます。
  </x-card>
  <x-card data-title="設定ガイド" data-icon="lucide:settings" data-href="/configuration">
    利用可能なすべての設定を深く掘り下げ、config.yamlファイルを手動で微調整する方法を学びます。
  </x-card>
</x-cards>