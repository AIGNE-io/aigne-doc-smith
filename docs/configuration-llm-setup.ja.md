# LLMセットアップ

AIGNE DocSmithは、大規模言語モデル（LLM）を使用してドキュメントコンテンツを生成します。AIモデルプロバイダーは、統合されたAIGNE Hubを使用する方法と、独自のカスタムAPIキーを接続する方法の2通りで設定できます。

## AIGNE Hub（推奨）

最も手軽に始める方法はAIGNE Hubを使用することです。これは複数のLLMプロバイダーへのゲートウェイとして機能し、主に2つの利点があります：

- **APIキー不要：** 独自のAPIキーやサービス契約を管理することなく、ドキュメントを生成できます。
- **簡単なモデル切り替え：** `--model`フラグを使用することで、どのコマンドでもAIモデルを変更できます。

AIGNE Hubを通じて特定のモデルを使用するには、コマンドに`--model`フラグを追加します。以下にいくつかの例を示します：

```bash Using Different Models via AIGNE Hub icon=mdi:code-braces
# GoogleのGemini 2.5 Flashモデルを使用
aigne doc generate --model google:gemini-2.5-flash

# AnthropicのClaude 3.5 Sonnetモデルを使用
aigne doc generate --model claude:claude-3-5-sonnet

# OpenAIのGPT-4oモデルを使用
aigne doc generate --model openai:gpt-4o
```

モデルを指定しない場合、DocSmithはプロジェクトの設定ファイルで定義されたデフォルトのモデルを使用します。

## カスタムAPIキーの使用

OpenAIやAnthropicのようなプロバイダーで自身のアカウントを使用したい場合は、個人のAPIキーでDocSmithを設定できます。この方法により、APIの使用状況と請求を直接管理できます。

設定は対話型のウィザードを通じて行われます。ウィザードを起動するには、次のコマンドを実行してください：

```bash
aigne doc init
```

ウィザードがプロバイダーの選択と認証情報の入力を求めます。詳細なガイドについては、[対話型セットアップ](./configuration-interactive-setup.md)のドキュメントを参照してください。

## デフォルトモデルの設定

すべてのドキュメント生成タスクで一貫性を保つために、プロジェクトの`aigne.yaml`設定ファイルでデフォルトのLLMを設定できます。このモデルは、`--model`フラグを含まないコマンドで使用されます。

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

この例では、DocSmithはGoogleの`gemini-2.5-pro`モデルをデフォルトで使用し、`temperature`設定は`0.8`に設定されています。

---

LLMプロバイダーの設定が完了したら、ドキュメントの言語設定を管理する準備が整いました。サポートされている言語の完全なリストを確認し、それらを有効にする方法については、[言語サポート](./configuration-language-support.md)ガイドに進んでください。