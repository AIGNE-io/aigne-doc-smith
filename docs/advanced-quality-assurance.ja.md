# 品質保証

生成されるすべてのドキュメントが高い品質、一貫性、正確性の基準を満たすように、DocSmithには包括的で自動化された品質保証パイプラインが含まれています。これらの組み込みチェックは自動的に実行され、公開前に一般的なフォーマットエラー、リンク切れ、構造的な問題を特定してフラグを立てます。このプロセスにより、最終的な出力がプロフェッショナルで信頼性が高く、ユーザーがナビゲートしやすいものになることが保証されます。

```d2 品質保証パイプライン icon=lucide:shield-check
direction: down

Documentation-Content: {
  label: "ドキュメントコンテンツ"
  shape: rectangle
}

Quality-Assurance-Pipeline: {
  label: "品質保証パイプライン"
  shape: rectangle
  grid-columns: 3
  grid-gap: 50

  Markdown-Validation: {
    label: "1. Markdownとコンテンツの検証\n(remark-lintベース)"
    shape: rectangle

    Check-1: "有効なMarkdown構文"
    Check-2: "見出しの整合性"
    Check-3: "テーブルのフォーマット"
    Check-4: "コードブロックの整合性"
    Check-5: "コンテンツの完全性"
  }

  Link-Asset-Validation: {
    label: "2. リンクとアセットの整合性"
    shape: rectangle

    Check-6: "リンク切れの検出"
    Check-7: "ローカル画像の検証"
  }

  D2-Diagram-Validation: {
    label: "3. D2ダイアグラムの検証"
    shape: rectangle

    Check-8: "D2構文チェック"
  }
}

Validation-Result: {
  label: "すべてのチェックに合格？"
  shape: diamond
}

Published-Documentation: {
  label: "公開済みドキュメント"
  shape: rectangle
  style.fill: "#d4edda"
}

Error-Report: {
  label: "エラーレポート"
  shape: rectangle
  style.fill: "#f8d7da"
}

Documentation-Content -> Quality-Assurance-Pipeline: "入力"
Quality-Assurance-Pipeline -> Validation-Result: "検証"
Validation-Result -> Published-Documentation: "はい"
Validation-Result -> Error-Report: "いいえ"
```

## Markdownとコンテンツ構造の検証

品質保証の基盤は、コアとなるMarkdownが整形され、構造的に健全であることを保証することです。DocSmithは`remark-lint`をベースにした高度なリンターを採用しており、一般的な構造上の問題を検出するためのカスタムチェックで補完されています。

主な構造およびフォーマットのチェックには、次のものが含まれます。

*   **有効なMarkdown構文**：標準のMarkdownおよびGFM（GitHub Flavored Markdown）仕様への準拠。
*   **見出しの整合性**：同一ドキュメント内の重複した見出し、不適切な見出しのインデント、複数のトップレベル見出し（H1）の使用などの問題を検出します。
*   **テーブルのフォーマット**：テーブル構造が正しいことを検証します。特に、ヘッダー、区切り線、およびデータ行の列数の不一致をチェックします。
*   **コードブロックの整合性**：すべてのコードブロックが ``` で適切に開始および終了していることを保証します。また、レンダリングに影響を与える可能性のある、コードブロック内の一貫性のないインデントもチェックします。
*   **コンテンツの完全性**：生成されたコンテンツが適切な句読点で終わっていることを確認し、コンテンツが切り捨てられていないことを保証する検証ステップです。

## リンクとアセットの整合性

リンク切れや画像が見つからないことは、ユーザーエクスペリエンスを低下させます。DocSmithは、すべてのローカルリソースを検証するためのチェックを実行します。

*   **リンク切れの検出**：システムはすべての相対Markdownリンクをスキャンし、ターゲットパスがプロジェクトのドキュメント構造で定義された有効なドキュメントに対応していることを検証します。このチェックにより、ユーザーがドキュメントをナビゲートする際に「404 Not Found」エラーに遭遇するのを防ぎます。`http://`または`https://`で始まる外部リンクはチェックされません。
*   **ローカル画像の検証**：`![]()`を介して含まれるすべてのローカル画像について、バリデーターは参照されている画像ファイルが指定されたパスに存在することを確認します。これにより、最終的な出力に壊れた画像が表示されないようにします。

## D2ダイアグラムの検証

すべてのダイアグラムが正しくレンダリングされることを保証するため、DocSmithはすべてのD2ダイアグラムの構文を検証します。

`d2`とマークされた各コードブロックは、厳密な構文チェッカーによって処理されます。構文エラーが見つかった場合、生成プロセスは説明的なエラーメッセージとともに停止されます。これにより、壊れた、または不適切にレンダリングされた視覚的なダイアグラムを含むドキュメントの公開を防ぎます。