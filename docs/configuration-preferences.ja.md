# プリファレンスの管理

AIGNE DocSmithは、ユーザーのフィードバックから学習するように設計されています。生成されたコンテンツを洗練または修正すると、DocSmithはそのフィードバックをプリファレンスと呼ばれる永続的なルールに変換できます。これらのルールにより、特定のスタイル、構造要件、コンテンツポリシーが将来のドキュメント作成タスクで一貫して適用されるようになります。すべてのプリファレンスは、プロジェクトルートの `.aigne/doc-smith/preferences.yml` にある人間が読める形式のYAMLファイルに保存されます。

## プリファレンスのライフサイクル

以下の図は、フィードバックが再利用可能なルールになり、将来のタスクに適用され、コマンドラインから管理される方法を示しています。

```d2 プリファレンスのライフサイクル
direction: down

developer: {
  label: "開発者"
  shape: c4-person
}

docsmith-system: {
  label: "AIGNE DocSmith システム"
  shape: rectangle

  cli: {
    label: "CLI コマンド\n(refine / translate)"
    shape: rectangle
  }

  agent: {
    label: "内部解析 Agent"
    shape: rectangle
  }

  decision: {
    label: "フィードバックは\n再利用可能なポリシーか？"
    shape: diamond
  }

  create-rule: {
    label: "新しいプリファレンスルールを作成"
    shape: rectangle
  }
}

preferences-file: {
  label: ".aigne/doc-smith/preferences.yml"
  shape: cylinder
}

one-time-fix: {
  label: "一度限りの修正として適用"
  shape: oval
}

developer -> docsmith-system.cli: "1. フィードバックを提供"
docsmith-system.cli -> docsmith-system.agent: "2. フィードバックをキャプチャ"
docsmith-system.agent -> docsmith-system.decision: "3. 分析"
docsmith-system.decision -> docsmith-system.create-rule: "はい"
docsmith-system.create-rule -> preferences-file: "4. ルールをファイルに保存"
docsmith-system.decision -> one-time-fix: "いいえ"
```

### プリファレンスの作成方法

`refine` または `translate` の段階でフィードバックを提供すると、内部 Agent が入力を分析します。フィードバックが一度限りの修正（例：タイポの修正）か、再利用可能なポリシー（例：「コードコメントは常に英語で書く」）かを判断します。それが永続的な指示であると判断された場合、新しいプリファレンスルールを作成し、プロジェクトの `preferences.yml` ファイルに保存します。

### ルールのプロパティ

`preferences.yml` に保存される各ルールは、以下の構造を持っています。

<x-field-group>
  <x-field data-name="id" data-type="string" data-desc="ルールの一意なランダム生成された識別子（例：pref_a1b2c3d4e5f6g7h8）。"></x-field>
  <x-field data-name="active" data-type="boolean" data-desc="ルールが現在有効かどうかを示します。無効なルールは生成タスク中に無視されます。"></x-field>
  <x-field data-name="scope" data-type="string">
    <x-field-desc markdown>ルールをいつ適用するかを定義します。有効なスコープは `global`、`structure`、`document`、または `translation` です。</x-field-desc>
  </x-field>
  <x-field data-name="rule" data-type="string" data-desc="将来のタスクでAIに渡される、具体的で洗練された指示。"></x-field>
  <x-field data-name="feedback" data-type="string" data-desc="ユーザーから提供された元の自然言語のフィードバック。参照用に保存されます。"></x-field>
  <x-field data-name="createdAt" data-type="string" data-desc="ルールが作成された日時を示すISO 8601タイムスタンプ。"></x-field>
  <x-field data-name="paths" data-type="string[]" data-required="false">
    <x-field-desc markdown>オプションのファイルパスのリスト。存在する場合、ルールはこれらの特定のソースファイルに対して生成されるコンテンツにのみ適用されます。</x-field-desc>
  </x-field>
</x-field-group>

## CLIによるプリファレンスの管理

`aigne doc prefs` コマンドを使用して、保存されているすべてのプリファレンスを表示および管理できます。これにより、ルールの一覧表示、有効化、無効化、または永久的な削除が可能です。

### すべてのプリファレンスを一覧表示

有効なものと無効なものの両方を含む、保存されているすべてのプリファレンスの完全なリストを表示するには、`--list` フラグを使用します。

```bash すべてのプリファレンスを一覧表示 icon=lucide:terminal
aigne doc prefs --list
```

このコマンドは、各ルールのステータス、スコープ、ID、およびパスの制限を示すフォーマットされたリストを表示します。

```text 出力例 icon=lucide:clipboard-list
# ユーザープリファレンス

**フォーマットの説明：**
- 🟢 = 有効なプリファレンス, ⚪ = 無効なプリファレンス
- [scope] = プリファレンスのスコープ (global, structure, document, translation)
- ID = 一意のプリファレンス識別子
- Paths = 特定のファイルパス（該当する場合）

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   概要ドキュメントの最後に「次のステップ」セクションを追加する。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   コードコメントは英語で記述する必要があります。
```

### プリファレンスの無効化と再有効化

ルールを削除せずに一時的に無効にする必要がある場合は、`--toggle` フラグを使用してそのアクティブステータスを切り替えることができます。IDなしでコマンドを実行すると、インタラクティブモードが起動し、切り替えるプリファレンスを1つ以上選択できます。

```bash インタラクティブにプリファレンスを切り替える icon=lucide:terminal
aigne doc prefs --toggle
```

特定のルールを直接切り替えるには、`--id` フラグを使用してそのIDを指定します。このアクションは、内部の `deactivateRule` または `activateRule` 関数に対応しており、ルールの `active` プロパティを変更します。

```bash 特定のプリファレンスを切り替える icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### プリファレンスの削除

1つ以上のプリファレンスを永久に削除するには、`--remove` フラグを使用します。このアクションは `removeRule` 関数を呼び出し、元に戻すことはできません。

インタラクティブな選択プロンプトを表示するには、IDなしでコマンドを実行します。

```bash インタラクティブにプリファレンスを削除 icon=lucide:terminal
aigne doc prefs --remove
```

特定のルールを直接削除するには、`--id` フラグを使用してそのIDを指定します。

```bash 特定のプリファレンスを削除 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 次のステップ

プリファレンスの管理は、DocSmithをプロジェクト固有のニーズに合わせて調整するための重要な部分です。より多くのカスタマイズオプションについては、メインの[設定ガイド](./configuration.md)をご覧ください。