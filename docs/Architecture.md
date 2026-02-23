# Architecture.md — VJU Document Repository

> **最終更新:** 2026-02-23
> **ステータス:** 確定

---

## 1. System Constraints（絶対制約）

> [!IMPORTANT]
> - **Node.js 禁止**: npm / vite / webpack は使用不可
> - **ランタイム**: ブラウザのみ（GitHub Pages）
> - **ビルドステップ**: 存在しない。`index.html` 単体で動作する
> - **単一ファイル SPA**: 全 HTML / CSS / JS が `index.html` に集約
> - **静的ホスティング前提**: GitHub Pages またはローカルファイル直開きで動作可能であること

---

## 2. System Structure（システム構成）

```
/
  ├── index.html              # SPA エントリポイント（全コード含む）
  ├── firebase.json           # Firebase 設定
  ├── firestore.rules         # Firestore Security Rules
  ├── .nojekyll               # GitHub Pages Jekyll 無効化
  ├── data/                   # 公開文書データ
  │     ├── {DocID}_{Title}_transcription.md      # VI テキスト
  │     ├── {DocID}_{Title}_transcription_en.md   # EN テキスト
  │     ├── {DocID}_{Title}_transcription_ja.md   # JA テキスト
  │     ├── {DocID}_{Title}_source.pdf            # 元 PDF
  │     ├── search-index.json                     # 検索インデックス（自動生成）
  │     ├── glossary_vi_en_ja.md                  # 用語集
  │     └── Confidential/                         # 制限文書原本（Firestore経由で配信）
  ├── docs/                   # プロジェクト管理ドキュメント
  │     ├── Architecture.md   # ← このファイル
  │     ├── Spec.md
  │     ├── QA_CHECKLIST.md
  │     └── MIGRATION_PLAN.md # 文書移行計画（52文書）
  ├── scripts/                # ビルド・運用スクリプト
  │     ├── build-search-index.js   # 検索インデックス生成
  │     └── upload_to_firestore.js  # 制限文書 Firestore アップロード
  └── tmp/                    # 一時ファイル（gitignore 対象外）
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
| **DOC_REGISTRY** | 文書メタデータの単一ソース（doc_id, title, tags, date, department, type, restricted 等） |
| **Card Renderer** | `renderHomeCards()` — DOC_REGISTRY から動的にカード生成 |
| **Search Engine** | `filterDocs()` / `scoreDoc()` — 検索インデックス対応の多言語全文検索 |
| **Document Loader** | `loadPublicDoc()` / `loadRestrictedDoc()` |
| **YAML Parser** | `parseFrontMatter()` / `stripFrontMatter()` |
| **Markdown Renderer** | marked.js + `preprocessLegalMd()` による MD → HTML 変換 |
| **Reader** | 分割ビュー、TOC 生成、スクロール同期 |
| **Firebase Auth** | `handleSignIn()` / `handleSignOut()` / `isVjuMember()` |
| **Access Control** | `openDocument()` ゲート関数、ログインモーダル |

---

## 4. Data Flow（データフロー）

### 検索インデックス（オフライン生成）
```
data/*_transcription*.md
        │
        ▼
  node scripts/build-search-index.js
        │  YAML + 本文 500文字を抽出、3言語分
        ▼
  data/search-index.json (VI/EN/JA titles + body)
        │
        ▼
  Client: fetch → scoreDoc() で多言語全文検索
```

### 公開文書
```
GitHub Pages (data/*.md)
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
| `home` | DOC_REGISTRY から動的生成されるカード一覧、検索バー | — |
| `search` | 多言語全文検索結果（キーワード / 部署 / 種別フィルタ、ソート） | クエリパラメータ |
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

### 6.1 ビルドスクリプト（Node.js — ローカル実行のみ）

> **注意**: ランタイムは依然ブラウザのみ。以下は開発時のオフラインツール。

| スクリプト | 用途 |
|-----------|------|
| `scripts/build-search-index.js` | `data/*_transcription*.md` → `data/search-index.json` 生成 |
| `scripts/upload_to_firestore.js` | 制限文書を Firestore にアップロード |

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
