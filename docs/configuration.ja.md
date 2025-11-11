# 設定

適切な設定は、AIGNE DocSmith がプロジェクトの特定のニーズに合ったドキュメントを生成するための基本です。このプロセスでは、中央の設定ファイルを通じてプロジェクトレベルの設定を定義し、個人の好みを管理して生成プロセスを微調整します。

このセクションでは、ツールの設定方法の概要を説明します。詳細なステップバイステップの手順については、以下の特定のガイドを参照してください。

<x-cards data-columns="2">
  <x-card data-title="初期設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    対話式のセットアップガイドに従って、メインの `config.yaml` ファイルを作成します。これは、新しいドキュメントプロジェクトにとって不可欠な最初のステップです。
  </x-card>
  <x-card data-title="個人設定の管理" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    個人設定の表示、有効化、無効化、または削除方法を学びます。これにより、メインのプロジェクト設定を補完する特定のルールを適用できます。
  </x-card>
</x-cards>

## `config.yaml` ファイルについて

`config.yaml` ファイルは、ドキュメントプロジェクトの主要な指示源として機能します。これは初期設定プロセス中に生成され、AI がソースコードを分析してコンテンツを生成するために使用するすべてのコアディレクティブを含んでいます。正しく設定されたファイルは、出力が意図した対象読者、目的、およびスタイルに合わせて調整されることを保証します。

以下は、`config.yaml` ファイルに含まれる主要なパラメータの内訳です。

### コア設定パラメータ

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの正式名称。ドキュメント全体のタイトルやその他のメタデータで使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>プロジェクトの目的と機能を簡潔に1文で説明します。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>プロジェクトのロゴ画像を指す URL。公開されたドキュメントサイトのブランディングに使用されます。</x-field-desc>
  </x-field>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>AI の推論の労力を設定します。</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>推論の深さを決定します。オプションは `lite`（高速、基本）、`standard`（バランス）、`pro`（詳細、低速）です。</x-field-desc>
    </x-field>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>ドキュメントの主要な目標を定義します。例として、オンボーディングガイドのための `getStarted` や、手順説明のための `completeTasks` があります。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>想定される読者を指定します。例として、技術者ではない個人向けの `endUsers` や、エンジニア向けの `developers` があります。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>対象読者が持つと想定される技術的知識のレベルを記述します。例えば `completeBeginners` などです。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>生成されるコンテンツの詳細レベルを制御します。オプションは `essentialOnly` から `comprehensive` まであります。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>コンテンツ生成中に AI が従うべきカスタム指示や制約のセットです。</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true" data-default="en">
    <x-field-desc markdown>ドキュメントの主要な言語コード。例えば、英語の場合は `en` です。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>ドキュメントを翻訳すべき言語コードのリスト。例えば、`zh`（中国語）や `ja`（日本語）です。</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>生成されたドキュメントファイルが保存されるローカルディレクトリのパスです。</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>ツールがドキュメントを生成するために分析すべきソースファイル、ディレクトリ、または glob パターンのリストです。</x-field-desc>
  </x-field>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>メディアファイルの処理に関する設定です。</x-field-desc>
    <x-field data-name="minImageWidth" data-type="number" data-default="800" data-required="false">
      <x-field-desc markdown>このピクセル値より幅の広い画像のみがページ生成に使用されます。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

## まとめ

適切に定義された設定は、正確で、関連性が高く、効果的なドキュメントを作成するために不可欠です。初期設定を完了し、`config.yaml` ファイルを理解することで、すべてのドキュメント作成タスクの強固な基盤を確立できます。

プロジェクトの設定を進めるには、以下のガイドを参照してください：

*   **[初期設定](./configuration-initial-setup.md)**：プロジェクトの `config.yaml` ファイルを作成します。
*   **[個人設定の管理](./configuration-managing-preferences.md)**：個人のルールでツールの動作をカスタマイズします。