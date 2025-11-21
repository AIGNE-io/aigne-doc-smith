# はじめに

このガイドでは、AIGNE DocSmith をインストールし、最初のドキュメントセットを生成するための直接的なステップバイステップの手順を説明します。このプロセスは数分で完了するように設計されており、最小限のセットアップでプロジェクトファイルからドキュメントを生成できます。

以下の図は、インストールから生成までの主要なステップを示しています。

```d2
direction: down

Developer: {
  shape: c4-person
}

Terminal: {
  label: "ターミナル"
  shape: rectangle
}

Installation: {
  label: "インストール"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Install-CLI: {
    label: "1. AIGNE CLI のインストール"
    shape: oval
  }

  Verify-Installation: {
    label: "2. インストールの確認"
    shape: oval
  }
}

Generation: {
  label: "生成"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Run-Generate: {
    label: "3. 生成コマンドの実行"
    shape: oval
  }

  Interactive-Setup: {
    label: "4. 対話型セットアップの完了"
    shape: diamond
  }

  Automated-Process: {
    label: "5. 自動生成"
    shape: rectangle

    Analyze-Code: {
      label: "コードベースの分析"
    }

    Plan-Structure: {
      label: "構造の計画"
    }

    Generate-Content: {
      label: "コンテンツの生成"
    }
  }

  Output-Docs: {
    label: "6. ドキュメント生成完了"
    shape: oval
  }

  Analyze-Code -> Plan-Structure
  Plan-Structure -> Generate-Content
}

Developer -> Terminal: "コマンドを実行"
Terminal -> Installation.Install-CLI: "`npm install -g @aigne/cli`"
Installation.Install-CLI -> Installation.Verify-Installation: "`aigne doc --help`"
Installation.Verify-Installation -> Generation.Run-Generate: "`aigne doc create`"
Generation.Run-Generate -> Generation.Interactive-Setup: "初回実行時"
Generation.Interactive-Setup -> Generation.Automated-Process: "config.yaml を保存"
Generation.Automated-Process -> Generation.Output-Docs: "docs/ フォルダに出力"
Generation.Output-Docs -> Developer: "ドキュメントをレビュー"
```

## 前提条件

インストールを進める前に、お使いのシステムが以下の要件を満たしていることを確認してください。

*   **Node.js**: バージョン 20 以降が必要です。AIGNE DocSmith は Node Package Manager (npm) を使用してインストールされ、npm は Node.js のインストールに含まれています。Node.js をインストールするには、公式の [Node.js ウェブサイト](https://nodejs.org/) にアクセスし、お使いのオペレーティングシステムの手順に従ってください。インストールを確認するには、ターミナルを開いて `node -v` と `npm -v` を実行します。

開始にあたり、API キーは必要ありません。デフォルトでは、DocSmith は AI を活用した生成に AIGNE Hub サービスを使用します。これにより、直接的な設定なしで様々な大規模言語モデルにアクセスできます。

## インストール

このツールは、AIGNE コマンドラインインターフェース（CLI）の一部として配布されています。インストールは主に 2 つのステップで構成されます。

### ステップ 1: AIGNE CLI をインストールする

AIGNE CLI をシステムにグローバルにインストールするには、ターミナルで以下のコマンドを実行します。これにより、どのディレクトリからでも `aigne` コマンドが利用可能になります。

```bash AIGNE CLI のインストール icon=lucide:terminal
npm install -g @aigne/cli
```

### ステップ 2: インストールを確認する

インストールが完了したら、ドキュメントツールのヘルプコマンドを実行して、正常にインストールされたかを確認できます。

```bash インストールの確認 icon=lucide:terminal
aigne doc --help
```

インストールが成功すると、利用可能な DocSmith コマンドとそのオプションのリストが表示されます。

## 最初のドキュメントを生成する

以下の手順に従って、プロジェクトを分析し、完全なドキュメントセットを生成します。

### ステップ 1: プロジェクトディレクトリに移動する

ターミナルを開き、`cd` コマンドを使用して、カレントディレクトリをドキュメント化したいプロジェクトのルートに変更します。

```bash ディレクトリの変更 icon=mdi:folder-open
cd /path/to/your/project
```

### ステップ 2: 生成コマンドを実行する

`generate` コマンドを実行します。この単一のコマンドで、プロジェクトの分析からコンテンツの生成まで、ドキュメント作成プロセス全体が開始されます。

```bash 生成コマンドの実行 icon=lucide:terminal
aigne doc create
```

### ステップ 3: 対話型セットアップを完了する

プロジェクトで初めて `generate` コマンドを実行すると、DocSmith は一度限りの対話型セットアッププロセスを起動します。ドキュメントの目的、対象読者、主要言語など、ドキュメントの設定に関する一連の質問に答えていきます。

![対話型セットアッププロセスのスクリーンショット](../../../assets/screenshots/doc-complete-setup.png)

これらの設定は `.aigne/doc-smith` ディレクトリにある `config.yaml` ファイルに保存され、いつでも手動で変更できます。

### ステップ 4: 生成を待つ

セットアップが完了すると、DocSmith は自動的に以下のアクションを実行します。

1.  **コードベースの分析**: ソースファイルをスキャンして、プロジェクトの構造とロジックを理解します。
2.  **構造の計画**: ドキュメントの論理的なアウトラインを作成し、セクションとトピックを定義します。
3.  **コンテンツの生成**: 分析と指定された設定に基づいてドキュメントを記述します。

完了すると、確認メッセージが表示されます。生成されたファイルは、セットアップ時に指定した出力ディレクトリ（デフォルトは `.aigne/doc-smith/docs`）で利用可能になります。

![生成後の成功メッセージのスクリーンショット](../../../assets/screenshots/doc-generated-successfully.png)

## 次のステップ

これで、最初のドキュメントセットの生成が正常に完了しました。以下は、ドキュメントの管理と強化のための一般的な次のステップです。

<x-cards data-columns="2">
  <x-card data-title="ドキュメント更新" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    コードの変更を反映したり、新しいフィードバックを取り入れたりするために、ドキュメントの特定の部分を修正または再生成します。
  </x-card>
  <x-card data-title="ドキュメントローカライズ" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    ドキュメントを、中国語、スペイン語、ドイツ語など、サポートされている 12 の言語のいずれかに翻訳します。
  </x-card>
  <x-card data-title="ドキュメント公開" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    チームや一般の人がオンラインでドキュメントにアクセスできるようにします。
  </x-card>
  <x-card data-title="設定の確認" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    初期設定時に作成された `config.yaml` ファイルを確認および修正して、設定を調整します。
  </x-card>
</x-cards>
