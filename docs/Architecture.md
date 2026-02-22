# Architecture.md — VJU Document Repository

> **最終更新:** 2026-02-21
> **ステータス:** 確定

---

## 1. System Constraints（絶対制約）

> [!IMPORTANT]
> - **Node.js 禁止**: npm / vite / webpack は使用不可
> - **ランタイム**: ブラウザのみ（GitHub Pages）
> - **ビルドステップ**: 存在しない。`index.html` 単体で動作する
> - **単一ファイル SPA**: 全 HTML / CSS / JS が `index.html` に集約

---

## 2. System Structure（システム構成）

```
docs/
  ├── index.html              # SPA エントリポイント（~1400行、全コード含む）
  ├── data/                   # 公開文書データ
  │     ├── {DocID}_{Title}_transcription.md      # VI テキスト
  │     ├── {DocID}_{Title}_transcription_en.md   # EN テキスト
  │     ├── {DocID}_{Title}_transcription_ja.md   # JA テキスト
  │     ├── {DocID}_{Title}_source.pdf            # 元 PDF
  │     └── glossary_vi_en_ja.md                  # 用語集
  ├── project/                # プロジェクト管理ドキュメント
  │     ├── Requirements.md
  │     ├── Architecture.md   # ← このファイル
  │     ├── Spec.md
  │     ├── TaskPlan.md
  │     ├── Testing.md
  │     └── Lessons.md
  ├── firebase-rules/         # Firebase Security Rules
  │     ├── firestore.rules
  │     └── storage.rules
  └── MIGRATION_PLAN.md       # 文書移行計画（52文書）
```

---

## 3. Module Boundaries（モジュール境界）

`index.html` 内の論理モジュール:

| モジュール | 責務 |
|-----------|------|
| **Tailwind Config** | カスタムカラー（vnu-blue 等）、フォント、シャドウ定義 |
| **CSS** | prose-legal スタイル、TOC スタイル、ドラッグハンドル |
| **HTML Views** | 4 つのビュー: home / search / department / reader |
| **Navigation** | `navigateTo(view)` による SPA ルーティング |
| **DOC_REGISTRY** | 文書ID → ファイル名プレフィックスのマッピング |
| **Document Loader** | `loadPublicDoc()` / `loadRestrictedDoc()` |
| **YAML Parser** | `parseFrontMatter()` / `stripFrontMatter()` |
| **Markdown Renderer** | marked.js による MD → HTML 変換 |
| **Reader** | 分割ビュー、TOC 生成、スクロール同期 |
| **Firebase Auth** | `handleSignIn()` / `handleSignOut()` / `isVjuMember()` |
| **Access Control** | `openDocument()` ゲート関数、ログインモーダル |

---

## 4. Data Flow（データフロー）

### 公開文書
```
GitHub Pages (docs/data/*.md)
        │
        ▼
  fetch() — Promise.all で 3言語並列取得
        │
        ▼
  stripFrontMatter() — YAML メタデータ除去
        │
        ▼
  marked.parse() — Markdown → HTML
        │
        ▼
  Split-view Reader — VI (左) + EN/JA (右)
```

### 制限文書
```
Firebase Auth (Google Sign-in)
        │ isVjuMember() チェック
        ▼
  Firestore: docs/{docId}/content/{lang}
        │
        ▼
  marked.parse() — Markdown → HTML
        │
        ▼
  Split-view Reader — VI (左) + EN/JA (右)

  Firebase Storage: restricted/{docId}.pdf
        │ getDownloadURL() — 署名付きURL
        ▼
  PDF ダウンロード / 閲覧
```

---

## 5. View Architecture（ビュー構成）

| ビュー | 内容 | URL パラメータ |
|--------|------|---------------|
| `home` | 文書カード一覧、カテゴリタブ、検索バー | — |
| `search` | 全文検索結果表示 | — |
| `department` | 部署別文書フィルタ | — |
| `reader` | 分割ビュー文書リーダー（TOC + VI + EN/JA） | `currentDocId` |

---

## 6. Tech Stack（技術スタック）

| 技術 | 用途 | 選定理由 |
|------|------|---------|
| **Tailwind CSS (CDN)** | スタイリング | ビルドなし、Play CDN で即利用可 |
| **marked.js (CDN)** | Markdown → HTML | 軽量、CDN 配信 |
| **Material Symbols** | アイコン | Google Fonts CDN |
| **Firebase Auth** | 認証 | Google Sign-in + ドメイン制限 |
| **Firestore** | 制限文書テキスト保存 | Security Rules でアクセス制御 |
| **Firebase Storage** | 制限 PDF 保存 | 署名付き URL で保護 |
| **GitHub Pages** | ホスティング | 無料、静的、CORS フリー |

---

## 7. Naming Convention（命名規則）

### ファイル名
```
{Document_ID}_{English_Title}_transcription.md       ← VI（原則）
{Document_ID}_{English_Title}_transcription_en.md    ← EN
{Document_ID}_{English_Title}_transcription_ja.md    ← JA
{Document_ID}_{English_Title}_source.pdf             ← 元 PDF
```

- **Document ID**: ベトナム公文書は `{番号}-{種別}-{発行者}`（例: `3626-QD-DHQGHN`）
- **English Title**: スペース区切りの英語タイトル

### YAML Front Matter の doc_id
- 公式表記（スラッシュ・ダイアクリティカル付き）: `3626/QĐ-ĐHQGHN`
- ファイル名・HTML 属性・JS キーではサニタイズ版を使用: `3626-QD-DHQGHN`

---

## 8. Authentication Architecture（認証アーキテクチャ）

```
┌─────────────────────────────────────────────┐
│  Client (index.html)                         │
│                                              │
│  ┌──────────┐   ┌──────────────┐            │
│  │ Sign In  │──▶│ Google Auth  │            │
│  │ Button   │   │ Popup        │            │
│  └──────────┘   └──────┬───────┘            │
│                         │                    │
│  onAuthStateChanged ◀───┘                    │
│         │                                    │
│  isVjuMember()                               │
│  ├── true  → loadRestrictedDoc() from Firestore
│  └── false → showAccessDenied()              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Firebase Security Rules                     │
│                                              │
│  Firestore: email.matches('.*@vju\\.ac\\.vn')│
│  Storage:   email.matches('.*@vju\\.ac\\.vn')│
└─────────────────────────────────────────────┘
```
