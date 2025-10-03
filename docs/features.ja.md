# コア機能

AIGNE DocSmithは、ドキュメントのライフサイクルを管理するための一連のコマンドを提供します。初期作成からグローバルな配布まで、プロセスは生成、改良、翻訳、公開という標準的なワークフローで構成されています。

```d2
direction: down

AIGNE-DocSmith-Workflow: {
  label: "AIGNE DocSmith ドキュメントライフサイクル"
  
  source-code: "ソースコード"

  generate: "ドキュメント生成"

  refine: "更新と改良"

  translate: "ドキュメント翻訳"

  publish: "ドキュメント公開"

  destinations: {
    grid-columns: 2
    grid-gap: 50

    docsmith-platform: {
      label: "DocSmith プラットフォーム"
      shape: cylinder
    }

    self-hosted: {
      label: "セルフホストインスタンス"
      shape: cylinder
    }
  }
}

AIGNE-DocSmith-Workflow.source-code -> AIGNE-DocSmith-Workflow.generate
AIGNE-DocSmith-Workflow.generate -> AIGNE-DocSmith-Workflow.refine
AIGNE-DocSmith-Workflow.refine -> AIGNE-DocSmith-Workflow.translate
AIGNE-DocSmith-Workflow.translate -> AIGNE-DocSmith-Workflow.publish
AIGNE-DocSmith-Workflow.publish -> AIGNE-DocSmith-Workflow.destinations.docsmith-platform
AIGNE-DocSmith-Workflow.publish -> AIGNE-DocSmith-Workflow.destinations.self-hosted
```

DocSmithの主な機能については、以下のセクションで詳しく説明します。

<x-cards data-columns="2">
  <x-card data-title="ドキュメント生成" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    単一のコマンドを使用して、ソースコードから完全なドキュメントセットを作成します。
  </x-card>
  <x-card data-title="更新と改良" data-icon="lucide:edit" data-href="/features/update-and-refine">
    コードの変更とドキュメントを同期させたり、特定のフィードバックに基づいて特定のドキュメントを再生成したりします。
  </x-card>
  <x-card data-title="ドキュメント翻訳" data-icon="lucide:languages" data-href="/features/translate-documentation">
    コンテンツを複数のサポートされている言語に翻訳し、プロジェクトを世界中のユーザーに利用できるようにします。
  </x-card>
  <x-card data-title="ドキュメント公開" data-icon="lucide:send" data-href="/features/publish-your-docs">
    生成されたドキュメントを公式のDocSmithプラットフォームまたは独自のセルフホストインスタンスに公開します。
  </x-card>
</x-cards>

これらの機能は、ドキュメントを作成および維持するための構造化されたワークフローを提供します。利用可能なすべてのコマンドとそのオプションの詳細なリストについては、[CLIコマンドリファレンス](./cli-reference.md)を参照してください。