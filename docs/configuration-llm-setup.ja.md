# LLM セットアップ

AIGNE DocSmith は、大規模言語モデル (LLM) を使用してドキュメンテーションコンテンツを生成します。AI モデルプロバイダーの設定は、主に 2 つの方法で行うことができます。統合された AIGNE Hub を利用する方法、またはお好みのプロバイダーから独自のカスタム API キーを接続する方法です。

## AIGNE Hub (推奨)

LLM を設定する最も直接的な方法は、AIGNE Hub を使用することです。これは複数の LLM プロバイダーへのゲートウェイとして機能し、主に 2 つの利点があります。

- **API キー不要:** 独自の API キーやサービスサブスクリプションを管理する必要なく、ドキュメントを生成できます。
- **柔軟なモデル切り替え:** `--model` フラグを使用することで、任意のコマンドの AI モデルを変更できます。

AIGNE Hub を介して特定のモデルを使用するには、コマンドに `--model` フラグを追加します。以下の例でその使用方法を示します。

```bash AIGNE Hub経由で異なるモデルを使用する icon=mdi:code-braces
# OpenAI の GPT-4o モデルを使用
aigne doc generate --model openai:gpt-4o

# Anthropic の Claude 4.5 Sonnet モデルを使用
aigne doc generate --model anthropic:claude-sonnet-4-5

# Google の Gemini 2.5 Pro モデルを使用
aigne doc generate --model google:gemini-2.5-pro
```

`--model` フラグが指定されていない場合、DocSmith はプロジェクトの設定ファイルで定義されたモデルをデフォルトで使用します。

## カスタム API キーの使用

OpenAI、Anthropic、Google などのプロバイダーで独自のアカウントを使用したいユーザーのために、DocSmith は個人の API キーで設定できます。この方法により、API の使用状況と請求を直接管理できます。

設定は対話型ウィザードを通じて行われます。起動するには、次のコマンドを実行します。

```bash 対話型ウィザードの起動 icon=lucide:magic-wand
aigne doc init
```

ウィザードがプロバイダーの選択と必要な認証情報の入力を求めます。このプロセスの完全なステップバイステップガイドについては、[インタラクティブ設定](./configuration-interactive-setup.md) のドキュメントを参照してください。

## デフォルトモデルの設定

すべてのドキュメント生成タスクで一貫性を保つため、プロジェクトの `aigne.yaml` 設定ファイルでデフォルトの LLM を設定できます。このモデルは、`--model` フラグを明示的に含まないすべてのコマンドで使用されます。

以下は設定例です。

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

この例では、DocSmith は Google の `gemini-2.5-pro` モデルを `temperature` 設定 `0.8` で、すべての生成タスクのデフォルトとして使用するように設定されています。

---

LLM プロバイダーの設定が完了したら、次のステップはドキュメントの言語設定を管理することです。[言語サポート](./configuration-language-support.md) ガイドに進み、サポートされている言語の全リストを確認し、それらを有効にする方法を学んでください。