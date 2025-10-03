# LLM の設定

AIGNE DocSmith は大規模言語モデル（LLM）を使用してドキュメントコンテンツを生成します。AI モデルプロバイダーは、統合された AIGNE Hub を使用する方法と、独自のカスタム API キーを接続する方法の2つの方法で設定できます。

## AIGNE Hub（推奨）

最も簡単な開始方法は AIGNE Hub を使用することです。これは複数の LLM プロバイダーへのゲートウェイとして機能し、主に2つの利点があります。

- **API キー不要：** 独自の API キーやサービスサブスクリプションを管理することなく、ドキュメントを生成できます。
- **簡単なモデル切り替え：** `--model` フラグを使用することで、任意のコマンドで AI モデルを変更できます。

AIGNE Hub を介して特定のモデルを使用するには、コマンドに `--model` フラグを追加します。以下にいくつかの例を示します。

```bash AIGNE Hub を介した異なるモデルの使用 icon=mdi:code-braces
# OpenAI の GPT-4o モデルを使用
aigne doc generate --model openai:gpt-4o

# Anthropic の Claude 3.5 Sonnet モデルを使用
aigne doc generate --model anthropic:claude-3-5-sonnet
```

モデルを指定しない場合、DocSmith はプロジェクトの設定で定義されたデフォルトモデルを使用します。

## カスタム API キーの使用

OpenAI や Anthropic などのプロバイダーで独自のアカウントを使用したい場合は、個人の API キーで DocSmith を設定できます。この方法では、API の使用状況と請求を直接管理できます。

設定は対話型ウィザードを通じて行われます。起動するには、次のコマンドを実行します。

```bash
aigne doc init
```

ウィザードでプロバイダーを選択し、認証情報を入力するよう求められます。詳細なガイドについては、[対話型設定](./configuration-interactive-setup.md) のドキュメントを参照してください。

## デフォルトモデルの設定

すべてのドキュメント生成タスクで一貫性を保つため、プロジェクトの `aigne.yaml` 設定ファイルでデフォルトの LLM を設定できます。このモデルは、`--model` フラグを含まないすべてのコマンドで使用されます。

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

この例では、DocSmith はデフォルトで Google の `gemini-2.5-pro` モデルを使用し、`temperature` 設定を `0.8` にするように設定されています。

---

LLM プロバイダーの設定が完了したら、ドキュメントの言語設定を管理する準備が整いました。[言語サポート](./configuration-language-support.md) ガイドに進み、サポートされている言語の全リストを確認し、それらを有効にする方法を学んでください。