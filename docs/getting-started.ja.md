# はじめに

このガイドでは、AIGNE DocSmithをインストールし、プロジェクトを設定し、ソースコードから完全なドキュメントセットを生成するための手順をステップバイステップで説明します。

## ステップ1：前提条件

始める前に、お使いのシステムにNode.jsとそのパッケージマネージャーであるnpmがインストールされていることを確認してください。DocSmithはNode.js環境で動作するコマンドラインツールです。

### Node.jsのインストール

以下に、さまざまなオペレーティングシステムにNode.jsをインストールするための簡単な手順を示します。

**Windows**
1.  公式の[Node.jsウェブサイト](https://nodejs.org/)からインストーラーをダウンロードします。
2.  `.msi`インストーラーを実行し、インストールウィザードの手順に従います。

**macOS**

推奨される方法は[Homebrew](https://brew.sh/)を使用することです：

```bash Terminal icon=lucide:apple
# Homebrewがインストールされていない場合はインストールします
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsをインストールします
brew install node
```

または、[Node.jsウェブサイト](https://nodejs.org/)から`.pkg`インストーラーをダウンロードすることもできます。

**Linux**

Ubuntu/Debianベースのシステムの場合：

```bash Terminal icon=lucide:laptop
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

CentOS/RHEL/Fedoraベースのシステムの場合：

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### 確認

インストール後、ターミナルで次のコマンドを実行して、Node.jsとnpmが利用可能であることを確認します：

```bash Terminal
node --version
npm --version
```

## ステップ2：AIGNE CLIのインストール

DocSmithツールは、AIGNEコマンドラインインターフェース（CLI）に含まれています。npmを使用してAIGNE CLIの最新バージョンをグローバルにインストールします：

```bash Terminal icon=logos:npm
npm i -g @aigne/cli
```

インストールが完了したら、ドキュメンテーションツールのヘルプコマンドを実行して確認します：

```bash Terminal
aigne doc -h
```

このコマンドを実行すると、DocSmithのヘルプメニューが表示され、使用準備が整ったことを確認できます。

## ステップ3：ドキュメントの生成

CLIがインストールされたので、1つのコマンドでドキュメントを生成できます。ターミナルでプロジェクトのルートディレクトリに移動し、次を実行します：

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### 自動設定

プロジェクトでこのコマンドを初めて実行すると、DocSmithは設定が存在しないことを検出し、自動的に対話式のセットアップウィザードを起動します。

![generateコマンドを実行するとセットアップウィザードが開始されます](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

ドキュメントの特性を定義するための一連の質問が表示されます。これには以下が含まれます：

- 主な目的とスタイル。
- 対象読者。
- 主要言語と翻訳用の追加言語。
- AIが分析するためのソースコードのパス。
- 生成されたドキュメントの出力ディレクトリ。

![プロンプトに答えてプロジェクトのセットアップを完了します](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定が完了すると、DocSmithはソースコードの分析、ドキュメント構造の計画、そしてコンテンツの生成に進みます。

![DocSmithが構造を計画し、ドキュメントを生成している様子](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## ステップ4：出力の確認

生成プロセスが終了すると、ターミナルに確認メッセージが表示されます。

![ドキュメント生成成功のメッセージ](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

新しいドキュメントは、セットアッププロセス中に指定した出力ディレクトリで利用可能になります。デフォルトの場所は`.aigne/doc-smith/docs`です。

## 次のステップ

最初のドキュメントセットを生成したので、他の機能を試すことができます：

<x-cards>
  <x-card data-title="コア機能" data-icon="lucide:box" data-href="/features">
    ドキュメントの更新からオンラインでの公開まで、主要なコマンドと機能を探ります。
  </x-card>
  <x-card data-title="設定ガイド" data-icon="lucide:settings" data-href="/configuration">
    config.yamlファイルを編集して、ドキュメントのスタイル、対象読者、言語を微調整する方法を学びます。
  </x-card>
  <x-card data-title="CLIコマンドリファレンス" data-icon="lucide:terminal" data-href="/cli-reference">
    利用可能なすべての `aigne doc` コマンドとそのオプションの完全なリファレンスを取得します。
  </x-card>
</x-cards>