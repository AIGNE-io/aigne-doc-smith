# トラブルシューティング

このガイドは、AIGNE DocSmith を使用する際の一般的な問題を診断し、修正するのに役立ちます。生成、公開、または設定中に問題が発生した場合は、以下のシナリオの解決策を確認してください。

---

## 設定の問題

### 問題 1: 設定ファイル形式のエラー

**エラーメッセージ:**
```
Error: Failed to parse config file: Implicit map keys need to be followed by map values at line 112, column 1:

lastGitHead: d9d2584f23aee352485f369f60142949db601283
appUrl： https://docsmith.aigne.io
```

```
Error: Failed to parse config file: Map keys must be unique at line 116, column 1:

docsDir: .aigne/doc-smith/docs
appUrl: https://docsmith.aigne.io
^
```

**考えられる原因:** 設定ファイル内の YAML 構文エラー。一般的な問題には以下が含まれます:
- インデントにスペースの代わりにタブを使用している
- 英語のコロン(:)の代わりに中国語のコロン(：)を使用している
- 必要な引用符が欠落している
- 設定項目が重複している

**解決策:**
1. エラーメッセージの行番号を確認して問題を特定します
2. インデントが正しいことを確認します（タブではなくスペースを使用）
3. コロンが英語の半角コロン(:)であり、中国語の全角コロン(：)でないことを確認します
4. オンラインの YAML バリデーターを使用して構文を確認します
5. 修正後、`aigne doc publish` を再度実行します

---

> **ヒント:** 設定ファイルの形式エラーを修正することに加えて、特定のパラメータが正しく設定されていない場合、システムは自動的にデフォルト値を使用します。これは基本的な機能には影響しません。

## 生成の問題

### 問題 2: 生成されたコンテンツが期待通りでない

**発生する可能性のある事象:**
- 生成されたコンテンツのトーンが要件と一致しない
- ドキュメントの構造が期待と一致しない
- いくつかの重要な情報が欠落している

**考えられる原因:**
1. 設定内の `rules` の記述が詳細でない、または明確でない
2. `targetAudienceTypes` の設定が実際のターゲットオーディエンスと一致しない
3. `sourcesPath` 内の参照ドキュメントが少なすぎる、または関連性がない

**修正方法:**
1. **`rules` を充実させる:** `config.yaml` に詳細なガイダンスを追加します:
   ```yaml
   rules: |
     ### Documentation Structure Requirements
     1. Each document must include:
        * Clear title and overview
        * Step-by-step instructions
        * Code examples where applicable
        * Troubleshooting section
     
     ### Content Tone
     - Use clear, concise language
     - Include concrete data and examples
     - Avoid marketing terminology
     - Focus on actionable information
   ```

2. **オーディエンスを調整する:** `targetAudienceTypes` が実際のオーディエンスと一致していることを確認します:
   ```yaml
   targetAudienceTypes:
     - endUsers      # エンドユーザー向け
     - developers     # 技術者向け
   ```

3. **ソースを追加する:** `sourcesPath` に関連ドキュメントを含めます:
   ```yaml
   sourcesPath:
     - ./README.md
     - ./docs
     - ./CHANGELOG.md
     - ./src
     - ./package.json
   ```

---

### 問題 3: 画像の品質が低い、または画像がない

**発生する可能性のある事象:**
- 生成されたドキュメント内の画像が十分に鮮明でない
- 期待される画像が表示されない

**原因:** `media.minImageWidth` の設定値が高すぎるため、一部の画像が除外されています。

**修正方法:**
1. `config.yaml` ファイルを開き、`media` 設定を見つけます:
   ```yaml
   media:
     minImageWidth: 800  # 現在のしきい値
   ```

2. 必要に応じてこの値を調整します:
   - **400-600**: より多くの画像が含まれますが、品質の低い画像が含まれる可能性があります
   - **600-800**: 品質と量のバランスが取れています（推奨設定）
   - **800-1000**: 高品質の画像のみで、数は少なくなります

3. ファイルを保存した後、更新コマンドを実行します:
   ```bash
   aigne doc update
   ```

---

### 問題 4: ドキュメントが欠落している、または不完全である

**発生する可能性のある事象:**
- 期待される一部のドキュメントが生成されない
- 生成されたドキュメントが不完全である

**考えられる原因:**
1. `sourcesPath` に必要なすべてのソースファイルが含まれていない
2. ソースファイルにアクセスできない、または権限の問題がある
3. `documentationDepth` が低く設定されている

**修正方法:**
1. **ソースパスを確認する:** 必要なすべてのファイルが含まれていることを確認します:
   ```yaml
   sourcesPath:
     - ./README.md
     - ./src              # ソースコードディレクトリを含める
     - ./docs             # 既存のドキュメントを含める
     - ./package.json      # 設定ファイルを含める
   ```

2. **ドキュメントの深度を上げる:** 包括的なドキュメントが必要な場合:
   ```yaml
   documentationDepth: comprehensive  # essentialOnly の代わりに
   ```

3. **ファイル権限を確認する:** DocSmith が `sourcesPath` 内のすべてのファイルへの読み取りアクセス権を持っていることを確認します

---

## 翻訳の問題

### 問題 5: 翻訳が失敗する、または品質が低い

**発生する可能性のある事象:**
- 翻訳コマンドが失敗する
- 翻訳されたコンテンツの品質が低い、またはエラーがある

**考えられる原因:**
1. `locale` と `translateLanguages` の設定が競合している
2. ソースドキュメントに構文エラーがある
3. 翻訳中のネットワーク問題

**修正方法:**
1. **言語設定を確認する:** `translateLanguages` に `locale` と同じ言語が含まれていないことを確認します:
   ```yaml
   locale: en
   translateLanguages:
     - zh        # OK
     - ja        # OK
     # - en      # ❌ locale の言語を含めないでください
   ```

2. **ソースドキュメントを修正する:** 翻訳前にソースドキュメントが有効であることを確認します:
   ```bash
   # まずソースドキュメントが正しいことを確認します
   aigne doc create
   
   # その後、翻訳します
   aigne doc translate
   ```

3. **翻訳を再試行する:** ネットワークの問題が発生した場合は、単にコマンドを再度実行します:
   ```bash
   aigne doc translate
   ```

---

## 公開の問題

### 問題 6: 無効な URL エラーで公開が失敗する

**エラーメッセージ:**
```
Error: ⚠️  The provided URL is not a valid ArcBlock-powered website

💡 Solution: To host your documentation, you can get a website from the ArcBlock store:
```

**原因:** 設定内の `appUrl` が空であるか、無効なウェブサイトアドレスを指しています。

**修正方法:**
`config.yaml` で正しいデプロイメントアドレスを設定します:
```yaml
# あなたのウェブサイトアドレスを入力してください
appUrl: https://your-site.user.aigne.io

# まだウェブサイトがない場合は、今のところ空にしておくことができます
# appUrl: ""
```

または、公開時に URL を指定することもできます:
```bash
aigne doc publish --appUrl https://your-docs-website.com
```

---

### 問題 7: 認証エラーで公開が失敗する

**エラーメッセージ:**
```
❌ Publishing failed due to an authorization error:
💡 Please run aigne doc clear to reset your credentials and try again.
```

```
❌ Publishing failed due to an authorization error:
💡 You're not the creator of this document (Board ID: docsmith). You can change the board ID and try again.
💡  Or run aigne doc clear to reset your credentials and try again.
```

**原因:** ログイン資格情報が期限切れであるか、指定されたボードに公開する権限がありません。

**修正方法:**
以下のコマンドを順番に実行します:
```bash
# まず古い認証情報をクリアします
aigne doc clear

# その後、再公開すると、システムは再度ログインを促します
aigne doc publish
```

`aigne doc clear` を実行する際、認証トークンをクリアすることを選択します。その後、`aigne doc publish` を再度実行すると、再認証を求められます。

---

### 問題 8: ネットワークの問題により公開が失敗する

**エラーメッセージ:**
```
❌ Could not connect to: https://your-site.com

Possible causes:
• There may be a network issue.
• The server may be temporarily unavailable.
• The URL may be incorrect.

Suggestion: Please check your network connection and the URL, then try again.
```

**修正方法:**
1. **ネットワーク接続を確認する:** ネットワークがターゲット URL にアクセスできることを確認します
2. **URL を確認する:** `appUrl` が正しく、アクセス可能であることを確認します
3. **再試行する:** ネットワークの問題は一時的なことが多いので、しばらくしてから再度試してください:
   ```bash
   aigne doc publish
   ```

---

## 回復方法

### 方法 1: Git を使用して復元する

コード管理に Git を使用している場合、以前の正常に動作していた設定に迅速に復元できます:

```bash
# 現在の変更を一時退避させる
git stash
```

その後、ドキュメントを再生成します:
```bash
aigne doc create
```

> **ヒント:** 後で一時退避させた変更を復元したい場合は、`git stash pop` を実行できます

---

### 方法 2: クリアして再生成する

特定できない問題に遭遇した場合、生成されたすべてのファイルをクリアして、最初から再生成することができます:

```bash
# 生成されたすべてのファイルをクリアし、その後再生成する
aigne doc clear && aigne doc create
```

> **注意:** これにより、生成されたすべてのコンテンツが削除されますが、設定ファイルには影響しません。実行後、システムは現在の設定に基づいてドキュメントを再生成します。

---

### 方法 3: 設定をリセットする

設定の問題が解決しない場合、設定ファイルをリセットすることができます:

```bash
# 設定をクリアする（プロンプトが表示されたら設定ファイルを選択）
aigne doc clear

# その後、再初期化する
aigne doc init
```

> **警告:** これにより現在の設定が削除されます。続行する前に、重要な設定をバックアップしてください。

---

## ベストプラクティス

一般的な問題を回避するための実践的な提案をいくつか紹介します:

1. **変更履歴を保存する:** Git を使用している場合、設定ファイルを変更するたびにコミットしておくと、問題が発生した場合に以前のバージョンに簡単に戻すことができます
2. **変更前にバックアップする:** 重要な設定を変更する前に、万が一に備えて設定ファイルをコピーしてバックアップします
3. **変更後すぐにテストする:** 設定を変更するたびに、すぐに `aigne doc create` または `aigne doc update` を実行してテストし、問題を早期に発見できるようにします
4. **形式の正しさを確認する:** YAML ファイルを変更した後、オンラインツールを使用して形式にエラーがないか確認します
5. **シンプルに始める:** 最もシンプルな設定から始め、すべてが機能することを確認してから、徐々により複雑な機能を追加します
6. **変更を記録する:** 毎回何を、なぜ変更したかを簡単に記録しておくと、後で問題が発生したときに原因を見つけやすくなります
7. **ソースを最新に保つ:** 定期的に `sourcesPath` を更新して、新しいソースファイルやドキュメントを含めます
8. **生成されたコンテンツを確認する:** 生成後、公開する前に出力内容を確認し、期待通りであることを確認します

---

## さらなるヘルプを得るには

上記の方法で問題が解決しない場合は、以下を試すことができます:

1. **設定ドキュメントを参照する:** [設定リファレンス](./configuration.md) を確認して、各設定項目の詳細な説明を理解します

2. **コマンドドキュメントを確認する:** コマンドドキュメントを参照して、コマンドの詳細な使用方法を理解します

3. **エラーログを確認する:** ターミナルに表示されるエラーメッセージを注意深く読みます。通常、具体的なヒントが含まれています

4. **AIGNE Observability を使用する:** 以下で説明する AIGNE Observability ツールを使用して、詳細な実行記録を取得します

5. **コミュニティに助けを求める:** [AIGNE コミュニティ](https://community.arcblock.io/discussions/boards/aigne) にアクセスして質問します。他のユーザーや開発者が手助けしてくれるかもしれません

---

## AIGNE Observability を使用したトラブルシューティング

詳細なトラブルシューティングが必要な複雑な問題に遭遇した場合、またはコミュニティに問題を報告する必要がある場合は、**AIGNE Observability** を使用できます。これは、実行プロセスの各ステップを詳細に記録し、あなたやテクニカルサポートが問題を迅速に特定するのに役立ちます。

### Observability サーバーの起動

以下のコマンドを実行して、ローカルの Observability サーバーを起動します:

```bash Observability サーバーを起動 icon=lucide:terminal
aigne observe
```

次のような出力が表示されます:
- データベースパス: 追跡データが保存される場所
- サーバーアドレス: このアドレスをブラウザで開くと、Observability ダッシュボードが表示されます

![Observability Command](../../../assets/screenshots/doc-aigne-observe.png)

### 実行記録の表示

1. **ダッシュボードを開く:** 出力に表示されたサーバーアドレスをクリックするか、ブラウザで開きます

2. **操作記録を表示する:** ダッシュボードには、以下を含むすべての DocSmith 操作が表示されます:
   - 入力および出力データ
   - 各ステップにかかった時間
   - 実行された操作ステップと結果
   - 詳細なエラーメッセージ

![Observability Dashboard](../../../assets/screenshots/doc-observe-dashboard.png)

### Observability を使用して問題を報告する

コミュニティに問題を報告する場合:

1. **追跡をキャプチャする:** 問題のある操作中に Observability サーバーを実行し続けます
2. **追跡データをエクスポートする:** ダッシュボードから関連する実行記録をエクスポートします
3. **問題を報告する:** [AIGNE コミュニティ](https://community.arcblock.io/discussions/boards/aigne) にアクセスし、以下を含めます:
   - 問題の説明
   - 再現手順
   - エクスポートされた追跡ファイル
   - あなたの設定（関連する場合）

> **ヒント:** 追跡記録には、すべての操作と結果を含む DocSmith の実行に関する完全な情報が含まれています。この情報をテクニカルサポートやコミュニティに提供することで、問題解決の効率が大幅に向上します。