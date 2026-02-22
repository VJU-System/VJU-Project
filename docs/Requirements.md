# Requirements.md — VJU Document Repository

> **最終更新:** 2026-02-21
> **関連:** Architecture.md, Spec.md, MIGRATION_PLAN.md

---

## 1. Goal / Success Criteria（目標と達成基準）

| # | 目標 | 達成基準 |
|---|------|---------|
| G1 | VJU の公式規程・通達を一元的に閲覧できる | 52 文書（VI/EN/JA 3言語）がブラウザ上で閲覧可能 |
| G2 | 多言語の規程を並列比較できる | 分割ビューで VI ⇔ EN/JA をスクロール同期表示 |
| G3 | 内部文書を `@vju.ac.vn` メンバーに限定公開できる | Firebase Auth + Security Rules でドメイン制限が機能する |
| G4 | GitHub Pages で静的ホスティングできる | ビルドステップなし、`index.html` 単体で動作する |
| G5 | 文書の検索・フィルタが可能 | カテゴリ・部署・キーワードで絞り込みできる |

---

## 2. User Stories（ユーザーストーリー）

### 学生・教職員（一般閲覧者）
- `US-01` 公開規程を VI/EN/JA で読みたい
- `US-02` 規程の条文を左右分割で原文と翻訳を比較したい
- `US-03` 目次（TOC）から特定の章・条へジャンプしたい
- `US-04` カテゴリ・部署で規程を探したい
- `US-05` キーワードで規程を検索したい
- `US-06` 元の PDF をダウンロードしたい

### VJU メンバー（認証済みユーザー）
- `US-07` `@vju.ac.vn` でログインして内部文書を閲覧したい
- `US-08` ログイン状態が画面に表示されていることを確認したい

### 管理者（コンテンツ管理）
- `US-09` Markdown ファイルを `docs/data/` にコミットするだけで公開したい
- `US-10` YAML Front Matter の `restricted: true` で文書のアクセスを制御したい
- `US-11` 制限文書を Firestore/Storage にアップロードして保護したい

---

## 3. Scope / Non-Scope

### 対象範囲（In Scope）
- 規程文書の多言語表示（VI / EN / JA）
- 分割ビューリーダー（スクロール同期）
- 目次（TOC）ナビゲーション
- Firebase Auth（Google Sign-in、ドメイン制限）
- 制限文書の Firestore/Storage 経由取得
- 文書カード一覧・カテゴリ別表示
- キーワード検索
- PDF ソースファイルのダウンロード
- 52 文書の段階的移行（MIGRATION_PLAN.md 参照）

### 対象外（Non-Scope）
- サーバーサイドレンダリング・バックエンド API
- 文書の作成・編集 UI（CMS は GitHub）
- Push 通知
- Node.js / npm ビルドプロセス
- オフラインキャッシュ（現時点では対象外）
- 全文検索エンジン（Algolia 等）

---

## 4. Non-Functional Requirements（非機能要件）

| カテゴリ | 要件 |
|---------|------|
| **パフォーマンス** | 3言語 MD を `Promise.all` で並列 fetch。初回表示 ≤ 3秒 |
| **セキュリティ** | Firebase config は公開可（Security Rules で保護）。API キー以外の秘密情報をクライアントに含めない |
| **アクセス制御** | `@vju.ac.vn` ドメインのみが制限文書にアクセス可能（Firebase Security Rules） |
| **ホスティング** | GitHub Pages（静的）。ビルドステップなし |
| **ブラウザ互換** | Chrome / Safari / Firefox 最新版 |
| **レスポンシブ** | デスクトップ（分割ビュー）・タブレット・モバイル対応 |
| **多言語** | UI ラベルは EN ベース。文書コンテンツは VI / EN / JA |
