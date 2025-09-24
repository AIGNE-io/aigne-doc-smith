# コア機能

AIGNE DocSmithは、ドキュメントのライフサイクルを管理するための一連のコマンドを提供します。初期作成からグローバルな配布までをサポートします。このプロセスは、ドキュメントの生成、改良、翻訳、公開という標準的なワークフローに整理されています。

```d2
direction: down

Generate: {
  label: "1. 生成\naigne doc generate"
  shape: rectangle
  description: "ソースコードから完全なドキュメントセットを作成します。"
}

Refine: {
  label: "2. 更新と改良\naigne doc update"
  shape: rectangle
  description: "ドキュメントをコードと同期させ、的を絞ったフィードバックを適用します。"
}

Translate: {
  label: "3. 翻訳\naigne doc translate"
  shape: rectangle
  description: "グローバルな読者のために、コンテンツを複数の言語にローカライズします。"
}

Publish: {
  label: "4. 公開\naigne doc publish"
  shape: rectangle
  description: "ドキュメントをパブリックまたはプライベートなプラットフォームにデプロイします。"
}

Generate -> Refine -> Translate -> Publish
```

以下のセクションで、DocSmithの主な機能について説明します。

<x-cards data-columns="2">
  <x-card data-title="ドキュメントの生成" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    単一のコマンドを使用して、ソースコードから完全なドキュメントセットを作成します。
  </x-card>
  <x-card data-title="更新と改良" data-icon="lucide:edit" data-href="/features/update-and-refine">
    ドキュメントをコードの変更と同期させたり、的を絞ったフィードバックで特定のドキュメントを再生成したりします。
  </x-card>
  <x-card data-title="ドキュメントの翻訳" data-icon="lucide:languages" data-href="/features/translate-documentation">
    コンテンツを複数のサポートされている言語に翻訳し、プロジェクトを世界中のユーザーに利用可能にします。
  </x-card>
  <x-card data-title="ドキュメントの公開" data-icon="lucide:send" data-href="/features/publish-your-docs">
    生成されたドキュメントを公式のDocSmithプラットフォームまたは自己ホスト型のインスタンスに公開します。
  </x-card>
</x-cards>

これらの機能は、ドキュメント作成のための構造化されたワークフローを提供します。利用可能なすべてのコマンドとそのオプションの詳細なリストについては、[CLIコマンドリファレンス](./cli-reference.md)を参照してください。