# 設定

適切な設定は、AIGNE DocSmith ツールがプロジェクト固有のニーズに合ったドキュメントを生成するための基本です。このプロセスでは、中央の設定ファイルでプロジェクトレベルの設定を定義し、個人の設定を管理して生成プロセスを微調整します。

このセクションでは、ツールの設定方法の概要を説明します。詳細な手順については、以下の各ガイドを参照してください。

<x-cards data-columns="2">
  <x-card data-title="初期設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    対話式のセットアップガイドに従って、主要な `config.yaml` ファイルを作成します。これは、新しいドキュメントプロジェクトに不可欠な最初のステップです。
  </x-card>
  <x-card data-title="設定の管理" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    個人の設定を表示、有効化、無効化、または削除する方法を学びます。これにより、主要なプロジェクト設定を補完する特定のルールを適用できます。
  </x-card>
</x-cards>

## `config.yaml` ファイルについて

`config.yaml` ファイルは、ドキュメントプロジェクトにおける信頼できる唯一の情報源（source of truth）として機能します。このファイルは初期設定プロセスで生成され、AI がソースコードを分析してコンテンツを生成するために使用するすべてのコアディレクティブを含んでいます。正しく設定されたファイルにより、意図した読者、目的、スタイルに合わせた出力が保証されます。

以下に、`config.yaml` ファイルに含まれる主要なパラメータの内訳を示します。

### コア設定パラメータ

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの正式名称。ドキュメント全体のタイトルやその他のメタデータで使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの目的と機能を簡潔に一句で説明します。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>プロジェクトのロゴ画像を指す URL。公開されるドキュメントサイトのブランディングに使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>ドキュメントの主要な目標を定義します。例として、オンボーディングガイドのための `getStarted` や、手順を説明するための `completeTasks` があります。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>対象読者を指定します。例として、技術者ではない一般ユーザー向けの `endUsers` や、エンジニア向けの `developers` があります。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>対象読者に想定される技術知識と背景を記述します。例：`completeBeginners`。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>生成されるコンテンツの詳細度を制御します。オプションは `essentialOnly` から `comprehensive` まであります。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>コンテンツ生成プロセス中に AI が従うべきカスタム指示、ガイドライン、または制約のセットです。</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true">
    <x-field-desc markdown>ドキュメントの主要な言語コード。例：英語の場合は `en`。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>主要なドキュメントを翻訳する先の言語コードのリスト。例：`zh`（中国語）や `ja`（日本語）。</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>生成されたドキュメントファイルが保存されるローカルディレクトリのパス。</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>ツールがドキュメントを生成するために分析するソースファイル、ディレクトリ、または glob パターンのリスト。</x-field-desc>
  </x-field>
</x-field-group>

## まとめ

明確に定義された設定は、正確で、関連性が高く、効果的なドキュメントを作成するために不可欠です。初期設定を完了し、`config.yaml` ファイルを理解することで、すべてのドキュメント作成タスクの強固な基盤を築くことができます。

プロジェクトの設定を進めるには、以下のガイドを参照してください：
*   **[初期設定](./configuration-initial-setup.md)**：プロジェクトの `config.yaml` ファイルを作成します。
*   **[設定の管理](./configuration-managing-preferences.md)**：個人のルールでツールの動作をカスタマイズします。