# はじめに

このガイドでは、AIGNE DocSmith をインストールし、プロジェクトを設定し、ソースコードから完全なドキュメント一式を数分で生成するための手順をステップバイステップで説明します。

## ステップ1：前提条件

始める前に、お使いのシステムに Node.js バージョン 20 以降がインストールされていることを確認してください。DocSmith は Node.js 環境で動作するコマンドラインツールです。インストールには、Node.js に付属している Node Package Manager (npm) の使用を推奨します。

詳細なインストール手順については、公式の [Node.js ウェブサイト](https://nodejs.org/) を参照してください。一般的なオペレーティングシステム向けの簡単なガイドを以下に示します。

**Windows**
1.  [Node.js ダウンロードページ](https://nodejs.org/en/download) から Windows インストーラー (`.msi`) をダウンロードします。
2.  インストーラーを実行し、セットアップウィザードの指示に従います。

**macOS**

macOS のパッケージマネージャーである [Homebrew](https://brew.sh/) を使用したインストール方法を推奨します。

```bash Terminal icon=lucide:apple
# Homebrew がまだインストールされていない場合はインストールします
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js をインストールします
brew install node
```

または、[Node.js ウェブサイト](https://nodejs.org/) から直接 macOS インストーラー (`.pkg`) をダウンロードすることもできます。

**Linux**

Debian および Ubuntu ベースのディストリビューションでは、次のコマンドを使用します。

```bash Terminal icon=lucide:laptop
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Red Hat、CentOS、および Fedora では、次のコマンドを使用します。

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### インストールの確認

インストールが完了したら、ターミナルを開き、次のコマンドを実行して Node.js と npm が正しくインストールされていることを確認します。

```bash Terminal
node --version
npm --version
```

## ステップ2：AIGNE CLI のインストール

DocSmith ツールは、公式の AIGNE コマンドラインインターフェース (CLI) の一部として配布されています。npm を使用して、システムに CLI をグローバルにインストールします。

```bash Terminal icon=logos:npm
npm install -g @aigne/cli
```

インストールが完了したら、ヘルプコマンドを実行して DocSmith が利用可能であることを確認します。

```bash Terminal
aigne doc --help
```

このコマンドを実行すると、DocSmith のヘルプメニューが表示され、インストールが完了し、使用できる状態であることが確認できます。

## ステップ3：ドキュメントの生成

AIGNE CLI をインストールしたら、ドキュメントを生成できます。ターミナルでプロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

![generate コマンドを実行すると、プロセスが開始され、インテリジェントなセットアップウィザードがトリガーされます。](../assets/screenshots/doc-generate.png)

### 自動設定

新しいプロジェクトでこのコマンドを初めて実行すると、DocSmith は設定ファイルが存在しないことを検出し、プロセスをガイドするための対話型のセットアップウィザードを自動的に起動します。

ウィザードでは、ドキュメントの特性を定義するための一連の質問が表示されます。これには以下が含まれます。

*   主な目的とライティングスタイル。
*   対象読者（例：開発者、エンドユーザー）。
*   主要言語と翻訳用の追加言語。
*   AI が分析するソースコードのパス。
*   生成されたドキュメントファイルの出力ディレクトリ。

![一連の質問に答えて、プロジェクトのセットアップを完了します。](../assets/screenshots/doc-complete-setup.png)

プロンプトに回答すると、DocSmith は選択内容を設定ファイルに保存し、コードベースの分析を開始し、ドキュメント構造を計画し、コンテンツを生成します。

![DocSmith がドキュメント構造を計画し、ファイルの生成を開始します。](../assets/screenshots/doc-generate-docs.png)

## ステップ4：出力の確認

生成プロセスが完了すると、ターミナルに確認メッセージが表示され、ドキュメントが正常に作成されたことが示されます。新しいドキュメントは、セットアップ時に指定した出力ディレクトリにあります。デフォルト設定を使用した場合は、`.aigne/doc-smith/docs` にあります。

![確認メッセージは、ドキュメントが正常に生成されたことを示します。](../assets/screenshots/doc-generated-successfully.png)

## 次のステップ

最初のドキュメント一式が正常に生成されました。これで、より高度な機能やカスタマイズオプションを試す準備が整いました。

<x-cards>
  <x-card data-title="コア機能" data-icon="lucide:box" data-href="/features">
    ドキュメントの更新からオンラインでの公開まで、主要なコマンドと機能について学びます。
  </x-card>
  <x-card data-title="設定ガイド" data-icon="lucide:settings" data-href="/configuration">
    設定ファイルを編集して、ドキュメントのスタイル、対象読者、言語を微調整する方法を学びます。
  </x-card>
  <x-card data-title="CLI コマンドリファレンス" data-icon="lucide:terminal" data-href="/cli-reference">
    利用可能なすべての `aigne doc` コマンドとそのオプションの完全なリファレンスを取得します。
  </x-card>
</x-cards>