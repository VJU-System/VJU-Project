# TaskPlan.md — VJU Document Repository

> **最終更新:** 2026-02-23
> **ステータス:** 実行中

---

## Milestones

| # | マイルストーン | 内容 | Status |
|---|---------------|------|:------:|
| M1 | **基盤構築** | SPA 構造、ビュー遷移、文書リーダー | ✅ Done |
| M2 | **多言語リーダー** | 分割ビュー、TOC、スクロール同期 | ✅ Done |
| M3 | **Firebase Auth** | Google Sign-in、ドメイン制限、モーダル | ✅ Done |
| M4 | **文書移行 Phase 1** | Group A: VNU 規則 (10文書) | 🔄 3/10 |
| M5 | **文書移行 Phase 2** | Group B: VJU ガイドライン (19文書) | ⬜ Pending |
| M6 | **文書移行 Phase 3** | Group C-F: 省令・その他 (23文書) | ⬜ Pending |
| M7 | **Firebase 設定・本番** | Firebase プロジェクト作成、制限文書アップロード | ⬜ Pending |
| M8 | **検索・フィルタ強化** | 全文検索、高度なフィルタリング | ⬜ Pending |

---

## Dependencies（依存関係）

```
M1 (基盤) ✅
 └── M2 (多言語リーダー) ✅
      └── M3 (Firebase Auth) ✅
           ├── M7 (Firebase 本番設定)
           └── M4 (文書移行 Phase 1) 🔄
                └── M5 (文書移行 Phase 2)
                     └── M6 (文書移行 Phase 3)
                          └── M8 (検索強化)
```

---

## Implementation Order（実装順序）

### Phase 1: 基盤構築 ✅ Complete
- [x] `index.html` SPA 構造（home / search / department / reader）
- [x] Tailwind CSS + Material Symbols 設定
- [x] 文書カード一覧表示
- [x] 分割ビューリーダー（VI + EN/JA）
- [x] TOC 自動生成・ナビゲーション
- [x] スクロール同期
- [x] marked.js による Markdown レンダリング

### Phase 2: Firebase Auth ✅ Complete
- [x] Firebase Compat SDK 読み込み
- [x] Google Sign-in（ポップアップ）
- [x] `isVjuMember()` ドメイン検証
- [x] ナビバーにログイン UI
- [x] ログインモーダル / アクセス拒否モーダル
- [x] `openDocument()` ゲート関数
- [x] `loadRestrictedDoc()` Firestore 連携
- [x] Security Rules 定義

### Phase 3: 文書移行 🔄 In Progress
- [x] 命名規則策定（MIGRATION_PLAN.md）
- [x] YAML Front Matter テンプレート確定
- [x] 3626-QD-DHQGHN 移行完了（学部規程）
- [x] 3636-QD-DHQGHN 移行完了（修士規程）
- [x] 3638-QD-DHQGHN 移行完了（博士規程）
- [ ] Group A 残り 7 文書
- [ ] Group B: 19 文書
- [ ] Group C: 12 文書
- [ ] Group D: 5 文書
- [ ] Group E: 3 文書
- [ ] Group F: 3 文書

### Phase 4: Firebase 本番設定 ⬜ Pending
- [ ] Firebase Console でプロジェクト作成
- [ ] Authentication → Google Sign-in 有効化
- [ ] Firestore 作成 + Security Rules デプロイ
- [ ] Storage 作成 + Security Rules デプロイ
- [ ] `index.html` の Firebase config 設定
- [ ] 承認済みドメインに `cq8jx.github.io` 追加
- [ ] 制限文書のアップロード

### Phase 5: 検索・UI 強化 ⬜ Pending
- [ ] 全文検索の強化
- [ ] カテゴリ・部署フィルタの動的生成
- [ ] モバイル対応の最適化
- [ ] パフォーマンス計測・最適化

---

## Risk Notes（リスクと対応）

| リスク | 影響 | 対応 |
|--------|------|------|
| Firebase 無料枠超過 | 制限文書が読めなくなる | Spark プラン（1GiB Storage, 50K reads/day）で十分と想定。監視する |
| 52 文書の移行工数 | 完了まで時間がかかる | 優先順位に従い段階的に移行（Group A → B → E → C → D → F） |
| PDF ファイルサイズ | GitHub Pages 100MB 制限 | 大きい PDF は Firebase Storage に移行 |
| Google ポップアップブロック | ログインできない | ポップアップブロック検出時にリダイレクト認証にフォールバック |

---

## QA Progress Update（2026-02-23）

### 実施済み
- [x] `3626` / `3636` の QA 第1段（決定文タイトル、レイアウト整合、VI/EN/JA 構造整合）
- [x] `3626` / `3636` の transcription 修正（VI/EN/JA）
- [x] `index.html` に `content-only print/export`（本文のみ印刷/保存）追加
- [x] ブラウザ直接確認 + ブラウザPDF保存比較の手順を追加して検証
- [x] QA知見を `docs/QA_CHECKLIST.md` に反映（content-only PDF比較、比較範囲記録、疑わしい改行検知/修正）
- [x] 点項目（`a) b) c)`）の字下げ幅を調整（`3em -> 1.5em`）
- [x] GitHub `main` に push 済み（Pages確認可能）

### 継続中
- [ ] 疑わしい改行（極端に早い改行）の誤検知除外 + 一括修正（主に `3636` EN/JA）

### 既知の課題
- `content-only print/export` 導入前のブラウザ印刷PDFは UI 全体を含み、原本PDFとの忠実比較に不向き
- `Gemini CLI` で `gemini-3.1-pro` 指定時に `ModelNotFound`（モデル名/提供名の差異の可能性）

## Next QA Plan（直近計画）

1. `Gemini` を `gemini-3.1-pro-preview` 指定で再実行し、疑わしい改行候補の真偽判定 + 修正を実施
2. 失敗時は `Gemini 2.5 Flash Lite` を検索補助に使って候補の妥当性を確認
3. 最終フォールバックで `Claude` に同タスクを実施
4. 修正後、`3626` / `3636` を再確認（ブラウザ表示 + content-only PDF 比較）
5. 追加修正分を commit / push
