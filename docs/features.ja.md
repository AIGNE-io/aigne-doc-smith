# コア機能

AIGNE DocSmithは、初期作成からグローバルな配布まで、ドキュメントのライフサイクルを管理するための一連のコマンドを提供します。プロセスは、ドキュメントの生成、改良、翻訳、公開という標準的なワークフローに整理されています。

```d2
direction: down

source-code: {
  label: "ソースコード"
  shape: rectangle
}

generate-documentation: {
  label: "ドキュメントの生成"
  shape: rectangle
}

update-and-refine: {
  label: "更新と改良"
  shape: rectangle
}

translate-documentation: {
  label: "ドキュメントの翻訳"
  shape: rectangle
}

publish-docs: {
  label: "ドキュメントの公開"
  shape: rectangle
}

platform: {
  label: "DocSmith プラットフォーム\n(またはセルフホスト)"
  shape: cylinder
}

source-code -> generate-documentation
generate-documentation -> update-and-refine
update-and-refine -> translate-documentation
translate-documentation -> publish-docs
publish-docs -> platform
```

以下のセクションで、DocSmithの主な機能をご覧ください。

<x-cards data-columns="2">
  <x-card data-title="ドキュメントの生成" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    単一のコマンドを使用して、ソースコードから完全なドキュメントセットを作成します。
  </x-card>
  <x-card data-title="更新と改良" data-icon="lucide:edit" data-href="/features/update-and-refine">
    ドキュメントをコードの変更と同期させたり、特定のフィードバックを基に特定のドキュメントを再生成したりします。
  </x-card>
  <x-card data-title="ドキュメントの翻訳" data-icon="lucide:languages" data-href="/features/translate-documentation">
    コンテンツを複数の対応言語に翻訳し、プロジェクトを世界中のオーディエンスにアクセス可能にします。
  </x-card>
  <x-card data-title="ドキュメントの公開" data-icon="lucide:send" data-href="/features/publish-your-docs">
    生成したドキュメントを公式のDocSmithプラットフォームまたは独自のセルフホストインスタンスに公開します。
  </x-card>
</x-cards>

これらの機能は、ドキュメントを作成および保守するための構造化されたワークフローを提供します。利用可能なすべてのコマンドとそのオプションの詳細なリストについては、[CLIコマンドリファレンス](./cli-reference.md)を参照してください。