# プリファレンスの管理

AIGNE DocSmithは、ユーザーのフィードバックから学習するように設計されています。生成されたコンテンツを調整または修正すると、DocSmithはそのフィードバックを「プリファレンス」と呼ばれる永続的なルールに変換できます。これらのルールにより、特定のスタイル、構造要件、コンテンツポリシーが将来のドキュメント作成タスクで一貫して適用されるようになります。すべてのプリファレンスは、プロジェクトのルートにある人間が読めるYAMLファイル `.aigne/doc-smith/preferences.yml` に保存されます。

## プリファレンスのライフサイクル

次の図は、フィードバックが再利用可能なルールとなり、将来のタスクに適用され、コマンドラインから管理されるまでの流れを示しています。

```d2 プリファレンスのライフサイクル
direction: down

feedback: {
  label: "1. ユーザーが「refine」または「translate」中に\nフィードバックを提供"
  shape: rectangle
}

refiner: {
  label: "2. Feedback Refiner Agentが\nフィードバックを分析"
  shape: rectangle
}

decision: {
  label: "再利用可能なポリシーか？"
  shape: diamond
}

pref_file: {
  label: "3. preferences.yml\nルールが保存される"
  shape: cylinder
}

future_tasks: {
  label: "4. 将来のタスク\n保存されたルールが適用される"
  shape: rectangle
}

cli: {
  label: "5. CLI管理\n('aigne doc prefs')"
  shape: rectangle
}

feedback -> refiner: "入力"
refiner -> decision: "分析"
decision -> pref_file: "はい"
decision -> "破棄（一度限りの修正）": "いいえ"
pref_file -> future_tasks: "適用される"
cli <-> pref_file: "管理"

```

### プリファレンスが作成される仕組み

`refine` または `translate` の段階でフィードバックを提供すると、内部のAgentがその入力を分析します。フィードバックが一度限りの修正（例：タイポの修正）なのか、再利用可能なポリシー（例：「コードコメントは常に英語で書く」）なのかを判断します。それが永続的な指示であると判断された場合、新しいプリファレンスルールが作成されます。

### ルールのプロパティ

`preferences.yml` に保存される各ルールは、次の構造を持っています：

<x-field data-name="id" data-type="string" data-desc="ルールの一意なランダムに生成された識別子（例：pref_a1b2c3d4e5f6g7h8）。"></x-field>
<x-field data-name="active" data-type="boolean" data-desc="ルールが現在有効かどうかを示します。無効なルールは生成タスク中に無視されます。"></x-field>
<x-field data-name="scope" data-type="string" data-desc="ルールをいつ適用するかを定義します。有効なスコープは 'global'、'structure'、'document'、または 'translation' です。"></x-field>
<x-field data-name="rule" data-type="string" data-desc="将来のタスクでAIに渡される、具体的で洗練された指示。"></x-field>
<x-field data-name="feedback" data-type="string" data-desc="参照用に保存される、ユーザーが提供した元の自然言語のフィードバック。"></x-field>
<x-field data-name="createdAt" data-type="string" data-desc="ルールが作成された日時を示すISO 8601形式のタイムスタンプ。"></x-field>
<x-field data-name="paths" data-type="string[]" data-required="false" data-desc="オプションのファイルパスのリスト。存在する場合、ルールはこれらの特定のソースファイルに対して生成されたコンテンツにのみ適用されます。"></x-field>

## CLIによるプリファレンスの管理

`aigne doc prefs` コマンドを使用して、保存されているすべてのプリファレンスを表示および管理できます。これにより、ルールの一覧表示、有効化、無効化、または恒久的な削除が可能です。

### すべてのプリファレンスを一覧表示する

有効なものと無効なものを含め、保存されているすべてのプリファレンスを表示するには、`--list` フラグを使用します。

```bash すべてのプリファレンスを一覧表示する icon=lucide:terminal
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
   概要ドキュメントの末尾に「次のステップ」セクションを追加する。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   コードコメントは英語で記述する必要があります。
```

### プリファレンスの無効化と再有効化

ルールを削除せずに一時的に無効にしたい場合は、`--toggle` フラグを使用してアクティブステータスを切り替えることができます。IDなしでコマンドを実行すると、対話モードが起動し、切り替えたいプリファレンスを1つ以上選択できます。

```bash 対話形式でプリファレンスを切り替える icon=lucide:terminal
aigne doc prefs --toggle
```

特定のルールを直接切り替えるには、`--id` フラグでそのIDを指定します。これは `deactivateRule` 関数に対応しており、ルールの `active` プロパティを `false` に設定します。

```bash 特定のプリファレンスを切り替える icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### プリファレンスの削除

1つ以上のプリファレンスを完全に削除するには、`--remove` フラグを使用します。この操作は `removeRule` 関数に対応し、元に戻すことはできません。

対話的な選択プロンプトを表示するには、IDなしでコマンドを実行します。

```bash 対話形式でプリファレンスを削除する icon=lucide:terminal
aigne doc prefs --remove
```

特定のルールをIDで直接削除するには、`--id` フラグを使用します。

```bash 特定のプリファレンスを削除する icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 次のステップ

プリファレンスの管理は、DocSmithをプロジェクトの特定のニーズに合わせて調整するための重要な部分です。さらなるカスタマイズオプションについては、メインの[設定ガイド](./configuration.md)をご覧ください。