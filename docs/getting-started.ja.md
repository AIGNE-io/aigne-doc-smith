# はじめに

このガイドでは、AIGNE DocSmithをインストールし、プロジェクトを設定し、ソースコードから完全なドキュメント一式を数分で生成するためのステップバイステップの手順を説明します。

## ステップ1：前提条件

始める前に、お使いのシステムにNode.jsバージョン20以降がインストールされていることを確認してください。DocSmithはNode.js環境で動作するコマンドラインツールです。インストールには、Node.jsに付属しているNode Package Manager（npm）の使用を推奨します。

詳細なインストール手順については、公式の[Node.jsウェブサイト](https://nodejs.org/)を参照してください。以下に、一般的なオペレーティングシステム向けの簡単なガイドを示します。

**Windows**
1.  [Node.jsのダウンロードページ](https://nodejs.org/en/download)からWindowsインストーラー（`.msi`）をダウンロードします。
2.  インストーラーを実行し、セットアップウィザードの指示に従います。

**macOS**

推奨されるインストール方法は、macOS用のパッケージマネージャーである[Homebrew](https://brew.sh/)を使用することです。

```bash Terminal icon=lucide:apple
# Homebrewがまだインストールされていない場合はインストールします
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsをインストールします
brew install node
```

または、[Node.jsウェブサイト](https://nodejs.org/)から直接macOSインストーラー（`.pkg`）をダウンロードすることもできます。

**Linux**

DebianおよびUbuntuベースのディストリビューションでは、次のコマンドを使用します。

```bash Terminal icon=lucide:laptop
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Red Hat、CentOS、およびFedoraでは、次のコマンドを使用します。

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### インストールの確認

インストールが完了したら、ターミナルを開き、次のコマンドを実行してNode.jsとnpmが正しくインストールされていることを確認します。

```bash Terminal
node --version
npm --version
```

## ステップ2：AIGNE CLIのインストール

DocSmithツールは、公式のAIGNEコマンドラインインターフェース（CLI）の一部として配布されています。npmを使用してCLIをシステムにグローバルインストールします。

```bash Terminal icon=logos:npm
npm install -g @aigne/cli
```

インストールが完了したら、ヘルプコマンドを実行してDocSmithが利用可能であることを確認します。

```bash Terminal
aigne doc --help
```

このコマンドを実行すると、DocSmithのヘルプメニューが表示され、インストールが完了し使用準備が整っていることが確認できます。

## ステップ3：ドキュメントの生成

AIGNE CLIがインストールされたので、ドキュメントを生成できます。ターミナルでプロジェクトのルートディレクトリに移動し、次のコマンドを実行します。

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### 自動設定

新しいプロジェクトでこのコマンドを初めて実行すると、DocSmithは設定ファイルが存在しないことを検出し、プロセスを案内する対話式のセットアップウィザードを自動的に起動します。

ウィザードでは、ドキュメントの特性を定義するための一連の質問が表示されます。これには以下が含まれます。

*   主な目的とライティングスタイル。
*   対象読者（例：開発者、エンドユーザー）。
*   主要言語と翻訳用の追加言語。
*   AIが分析するためのソースコードのパス。
*   生成されたドキュメントファイルの出力ディレクトリ。

プロンプトに回答すると、DocSmithは選択内容を設定ファイルに保存し、コードベースの分析、ドキュメント構造の計画、コンテンツの生成を開始します。

## ステップ4：出力の確認

生成プロセスが完了すると、ターミナルに確認メッセージが表示され、ドキュメントが正常に作成されたことが示されます。新しいドキュメントは、設定時に指定した出力ディレクトリにあります。デフォルト設定を使用した場合は、`.aigne/doc-smith/docs`にあります。

## 次のステップ

これで、最初のドキュメント一式が正常に生成されました。次に、より高度な機能やカスタマイズオプションを試す準備ができました。

<x-cards>
  <x-card data-title="コア機能" data-icon="lucide:box" data-href="/features">
    ドキュメントの更新からオンラインでの公開まで、主要なコマンドと機能を探ります。
  </x-card>
  <x-card data-title="設定ガイド" data-icon="lucide:settings" data-href="/configuration">
    設定ファイルを編集して、ドキュメントのスタイル、対象読者、言語を微調整する方法を学びます。
  </x-card>
  <x-card data-title="CLIコマンドリファレンス" data-icon="lucide:terminal" data-href="/cli-reference">
    利用可能なすべての `aigne doc` コマンドとそのオプションの完全なリファレンスを取得します。
  </x-card>
</x-cards>