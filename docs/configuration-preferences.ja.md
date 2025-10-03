# プリファレンスの管理

AIGNE DocSmith は、フィードバックから学習するように設計されています。生成されたコンテンツを改良または修正すると、DocSmith はそのフィードバックをプリファレンスと呼ばれる永続的なルールに変換できます。これらのルールにより、特定のスタイル、構造要件、コンテンツポリシーが将来のドキュメント作成タスクで一貫して適用されるようになります。すべてのプリファレンスは、プロジェクトルートの `.aigne/doc-smith/preferences.yml` にある人間が読めるYAMLファイルに保存されます。

## プリファレンスのライフサイクル

次の図は、フィードバックが再利用可能なルールになり、将来のタスクに適用され、コマンドラインから管理される方法を示しています。

```d2 プリファレンスのライフサイクル
direction: down

developer: {
  label: "開発者"
  shape: person
}

docsmith_system: {
  label: "AIGNE DocSmith システム"
  shape: rectangle

  cli: {
    label: "CLI コマンド\n(refine / translate)"
    shape: rectangle
  }

  agent: {
    label: "内部分析 Agent"
    shape: rectangle
  }

  decision: {
    label: "フィードバックは\n再利用可能なポリシーか？"
    shape: diamond
  }

  create_rule: {
    label: "新しいプリファレンスルールを作成"
    shape: rectangle
  }
}

preferences_file: {
  label: ".aigne/doc-smith/preferences.yml"
  shape: cylinder
}

one_time_fix: {
  label: "一度限りの修正として適用"
  shape: oval
}

developer -> docsmith_system.cli: "1. フィードバックを提供"
docsmith_system.cli -> docsmith_system.agent: "2. フィードバックをキャプチャ"
docsmith_system.agent -> docsmith_system.decision: "3. 分析"
docsmith_system.decision -> docsmith_system.create_rule: "はい"
docsmith_system.create_rule -> preferences_file: "4. ルールをファイルに保存"
docsmith_system.decision -> one_time_fix: "いいえ"
```

### プリファレンスの作成方法

`refine` または `translate` の段階でフィードバックを提供すると、内部 Agent が入力を分析します。フィードバックが一度限りの修正（例：タイポの修正）か、再利用可能なポリシー（例：「コードコメントは常に英語で書く」）かを判断します。それが永続的な指示を表す場合、新しいプリファレンスルールを作成し、プロジェクトの `preferences.yml` ファイルに保存します。

### ルールのプロパティ

`preferences.yml` に保存される各ルールは、次の構造を持ちます。

<x-field-group>
  <x-field data-name="id" data-type="string" data-desc="ルールの一意でランダムに生成された識別子（例：pref_a1b2c3d4e5f6g7h8）。"></x-field>
  <x-field data-name="active" data-type="boolean" data-desc="ルールが現在有効かどうかを示します。無効なルールは生成タスク中に無視されます。"></x-field>
  <x-field data-name="scope" data-type="string">
    <x-field-desc markdown>ルールをいつ適用するかを定義します。有効なスコープは `global`、`structure`、`document`、または `translation` です。</x-field-desc>
  </x-field>
  <x-field data-name="rule" data-type="string" data-desc="将来のタスクでAIに渡される、具体的で洗練された指示。"></x-field>
  <x-field data-name="feedback" data-type="string" data-desc="ユーザーから提供された元の自然言語のフィードバック。参照用に保存されます。"></x-field>
  <x-field data-name="createdAt" data-type="string" data-desc="ルールが作成された日時を示すISO 8601タイムスタンプ。"></x-field>
  <x-field data-name="paths" data-type="string[]" data-required="false">
    <x-field-desc markdown>オプションのファイルパスのリスト。存在する場合、ルールはこれらの特定のソースファイルに対して生成されたコンテンツにのみ適用されます。</x-field-desc>
  </x-field>
</x-field-group>

## CLIによるプリファレンスの管理

`aigne doc prefs` コマンドを使用して、保存されているすべてのプリファレンスを表示および管理できます。これにより、ルールの一覧表示、有効化、無効化、または永久に削除することができます。

### すべてのプリファレンスを一覧表示

保存されているすべてのプリファレンス（有効なものと無効なものの両方）の完全なリストを表示するには、`--list` フラグを使用します。

```bash すべてのプリファレンスを一覧表示 icon=lucide:terminal
aigne doc prefs --list
```

このコマンドは、各ルールのステータス、スコープ、ID、およびパスの制限を示すフォーマットされたリストを表示します。

```text 出力例 icon=lucide:clipboard-list
# ユーザープリファレンス

**フォーマットの説明：**
- 🟢 = 有効なプリファレンス, ⚪ = 無効なプリファレンス
- [scope] = プリファレンススコープ (global, structure, document, translation)
- ID = 一意のプリファレンス識別子
- Paths = 特定のファイルパス（該当する場合）

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   概要ドキュメントの最後に「次のステップ」セクションを追加します。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   コードコメントは英語で記述する必要があります。
```

### プリファレンスの無効化と再有効化

ルールを削除せずに一時的に無効にする必要がある場合は、`--toggle` フラグで有効ステータスを切り替えることができます。IDなしでコマンドを実行すると対話モードが起動し、切り替えるプリファレンスを1つ以上選択できます。

```bash プリファレンスを対話的に切り替える icon=lucide:terminal
aigne doc prefs --toggle
```

特定のルールを直接切り替えるには、`--id` フラグでそのIDを指定します。このアクションは、ルールの `active` プロパティを変更します。

```bash 特定のプリファレンスを切り替える icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### プリファレンスの削除

1つ以上のプリファレンスを完全に削除するには、`--remove` フラグを使用します。この操作は元に戻せません。

対話的な選択プロンプトを表示するには、IDなしでコマンドを実行します。

```bash プリファレンスを対話的に削除する icon=lucide:terminal
aigne doc prefs --remove
```

特定のルールを直接削除するには、`--id` フラグでそのIDを指定します。

```bash 特定のプリファレンスを削除する icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 次のステップ

プリファレンスの管理は、DocSmithをプロジェクトの特定のニーズに合わせて調整する上で重要な部分です。その他のカスタマイズオプションについては、メインの[設定ガイド](./configuration.md)をご覧ください。