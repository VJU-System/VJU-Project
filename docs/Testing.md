# Testing.md — VJU Document Repository

> **最終更新:** 2026-02-21

---

## 1. Definition of Done（完成の定義）

以下をすべて満たした場合にのみ「完成」とみなす:

- [ ] `index.html` を GitHub Pages でホストして動作する
- [ ] 公開文書（3626/3636/3638）が 3 言語で閲覧可能
- [ ] 分割ビューで VI ⇔ EN/JA が並列表示される
- [ ] TOC から章・条へのジャンプが機能する
- [ ] スクロール同期が動作する
- [ ] 制限付き文書をクリック → ログインモーダルが表示される
- [ ] `@vju.ac.vn` でログイン → 制限文書が閲覧可能（Firebase 設定後）
- [ ] `@gmail.com` でログイン → アクセス拒否モーダルが表示される
- [ ] PDF ソースファイルがダウンロード可能
- [ ] コンソールに未処理エラーがない

---

## 2. Test Strategy（テスト方針）

> **注意:** 静的サイトのためテストフレームワーク（Jest 等）は使用しない。
> 手動テストとブラウザ DevTools での検証を基本とする。

| 対象 | 検証方法 |
|------|---------|
| 公開文書読み込み | ブラウザで文書カードをクリック → 3 言語表示確認 |
| YAML Front Matter | DevTools Console で `parseFrontMatter()` の返り値を確認 |
| Firebase Auth | Google ログイン → `currentUser` / `isVjuMember()` の状態確認 |
| Security Rules | Firebase Console の Rules Playground でテスト |
| スクロール同期 | 左パネルスクロール → 右パネル追従を目視確認 |
| TOC ナビゲーション | TOC 項目クリック → 該当セクションへスクロール確認 |
| レスポンシブ | Chrome DevTools でモバイル / タブレットビュー確認 |

---

## 3. Edge Cases（エッジケース）

| ケース | 期待される動作 |
|--------|---------------|
| MD ファイルが 404 | 該当言語パネルに「Translation not available」表示 |
| YAML Front Matter なしの MD | `stripFrontMatter()` がテキストをそのまま返す |
| `restricted: true` だが Firebase 未設定 | ログインモーダルは表示されるが、ログイン後に Firestore エラー |
| Google ポップアップがブロックされた | エラーをキャッチし、ユーザーにポップアップ許可を促す |
| 非常に長い文書（500+ 行） | marked.js のレンダリングが遅延しないこと（3 秒以内） |
| DOC_REGISTRY に未登録の docId | `getDocPrefix()` が docId をそのまま返す（フォールバック） |
| 同一ブラウザタブで複数文書を連続閲覧 | メモリリークがないこと（innerHTML の上書き） |
| ドラッグハンドルでパネル比率を極端に変更 | 最小幅の制限が機能すること |

---

## 4. Failure Conditions（失敗条件）

以下が発生した場合は**バグとして必ず修正**する:

- ❌ 文書カードクリックで白画面になる
- ❌ YAML Front Matter がレンダリング結果に表示される
- ❌ `@gmail.com` でログインしたユーザーが制限文書を閲覧できる
- ❌ TOC クリックでスクロールが別のセクションに飛ぶ
- ❌ 分割ビューの片方が空白のまま更新されない
- ❌ `navigateTo()` でビューが切り替わらない
- ❌ Firebase config が placeholder のままなのにエラーがコンソールに出続ける

---

## 5. Regression Checklist（回帰テスト）

新しい文書を追加するたびに確認:

- [ ] DOC_REGISTRY にエントリを追加したか
- [ ] 3 言語の MD ファイルが `docs/data/` に存在するか
- [ ] YAML Front Matter が正しいフォーマットか
- [ ] `index.html` のカードに `data-doc` 属性を追加したか
- [ ] カードクリックでリーダーが開くか
- [ ] 3 言語すべてが正しくレンダリングされるか
