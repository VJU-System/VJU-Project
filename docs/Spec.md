# Spec.md — VJU Document Repository

> **最終更新:** 2026-02-23

---

## 1. Data Schema（データスキーマ）

### 1.1 YAML Front Matter（各 MD ファイル共通）
```yaml
---
doc_id: "3626/QĐ-ĐHQGHN"        # 公式文書番号（正式表記）
title: "Quy chế đào tạo..."      # 原語タイトル
date: 2022-10-24                  # 発行日
department: "Academic Affairs"    # 所管部署
type: "Regulation"                # 文書種別
restricted: false                 # true = VJU メンバー限定
last_updated: 2026-02-21          # 最終更新日
---
```

**department 値（DEPARTMENTS 定数）:**
| 値 | 説明 |
|----|------|
| `Academic Affairs` | 教務 |
| `Financial Affairs` | 財務 |
| `Quality Assurance` | 品質保証 |
| `General Affairs` | 総務 |
| `Student Affairs` | 学生 |

**type 値（DOC_TYPES 定数）:**
| 値 | 説明 |
|----|------|
| `Regulation` | 規則・規程 |
| `Circular` | 通達 |
| `Guideline` | ガイドライン・手引き |
| `Guidance` | 手引き・手順書 |
| `Notification` | 通知 |
| `Decree` | 政令 |
| `Decision` | 決定 |
| `Report` | 報告書 |
| `Plan` | 計画 |

### 1.2 DOC_REGISTRY（index.html 内）

文書メタデータの単一ソース。Home カードの動的生成、検索フィルタ、リーダーのファイルパス解決に使用。

```js
const DOC_REGISTRY = {
  '3626-QD-DHQGHN': {
    prefix: '3626-QD-DHQGHN_Regulation on Undergraduate Training',
    doc_id: '3626/QĐ-ĐHQGHN',           // 公式表記（ダイアクリティカル付き）
    title: 'Regulation on Undergraduate Training',
    tags: ['undergraduate', 'training', 'academic regulations'],
    date: '2022-10-24',                   // ISO 発行日
    department: 'Academic Affairs',        // DEPARTMENTS 定数のいずれか
    type: 'Regulation',                    // DOC_TYPES 定数のいずれか
    description: 'Decision 3626/QĐ-ĐHQGHN on...',  // 検索用概要
    restricted: false,                     // true = Firestore 配信
    relations: ['3636-QD-DHQGHN']          // 関連文書ID
  },
  // ... 全19文書（制限文書含む）
};
```

**動的カード生成**: `renderHomeCards()` が DOC_REGISTRY を日付降順でソートし、
各エントリからカード HTML を生成。タグクリックで検索ビューに遷移する。

### 1.5 検索インデックス（data/search-index.json）

`scripts/build-search-index.js` が全 `*_transcription*.md` から自動生成。

```json
{
  "3626-QD-DHQGHN_Regulation on Undergraduate Training": {
    "titles": { "vi": "Quy chế...", "en": "Regulation...", "ja": "学部..." },
    "body": { "vi": "...(500文字)", "en": "...", "ja": "..." },
    "doc_id": "3626/QĐ-ĐHQGHN",
    "registry_key": "3626-QD-DHQGHN",
    "date": "2022-10-24",
    "department": "Academic Affairs",
    "type": "Regulation"
  }
}
```

クライアント側で `scoreDoc()` がタイトル・本文・メタデータを重み付きスコアリング。

### 1.3 Firestore 構造（制限文書用）
```
docs/
  └── {docId}/
      └── content/
          ├── vi    → { text: "..." }
          ├── en    → { text: "..." }
          └── ja    → { text: "..." }
```

### 1.4 Storage 構造（制限 PDF 用）
```
restricted/
  └── {docId}.pdf
```

---

## 2. API Contract（データ取得仕様）

### 2.1 公開文書（GitHub Pages）
```
GET https://cq8jx.github.io/VJU-Project-2/data/{prefix}_transcription.md
GET https://cq8jx.github.io/VJU-Project-2/data/{prefix}_transcription_en.md
GET https://cq8jx.github.io/VJU-Project-2/data/{prefix}_transcription_ja.md
```
- 認証: 不要
- 3 言語を `Promise.all` で並列取得
- YAML Front Matter を `stripFrontMatter()` で除去後、`marked.parse()` で HTML 化

### 2.5 検索インデックス（GitHub Pages）
```
GET https://cq8jx.github.io/VJU-Project-2/data/search-index.json
```
- 認証: 不要
- 初回ロード時に非同期 fetch、グローバル変数 `searchIndex` に保持
- `scoreDoc()` が VI/EN/JA のタイトル・本文を重み付き検索

### 2.2 制限文書（Firestore）
```js
const docRef = doc(db, 'docs', docId, 'content', lang);
const snapshot = await getDoc(docRef);
```
- 認証: Firebase Auth（`@vju.ac.vn` ドメイン必須）
- Security Rules で email ドメイン検証

### 2.3 制限 PDF（Firebase Storage）
```js
const url = await getDownloadURL(ref(storage, `restricted/${docId}.pdf`));
```
- 署名付き URL で一時的にアクセスを許可

### 2.4 公開データ取得の運用ルール（GlobalNotice VN 統合）
- 公開データ取得元は GitHub の公開リポジトリ（`raw.githubusercontent.com` または GitHub Pages）に限定する
- GitHub API を直接たたかず、静的 JSON（例: `data.json`）を優先して取得する
- 認証トークン（GitHub API Token / PAT）は不要・使用禁止
- CORS 問題が出る場合は GitHub Pages 配信を優先する
- 独立リソースは `Promise.all` による並列取得を基本とする

---

## 3. Interface Rules（画面と状態遷移）

### ビュー遷移
```
[Home] — DOC_REGISTRY から動的カード生成
  │
  ├── カード選択
  │   ├── 公開文書 → [Reader] (fetch from GitHub Pages)
  │   └── 制限文書 →
  │         ├── 未ログイン → [Login Modal] → Google Auth → [Reader]
  │         ├── VJU メンバー → [Reader] (fetch from Firestore)
  │         └── 外部ユーザー → [Access Denied Modal]
  │
  ├── タグクリック → [Search] (dept: / type: フィルタ適用)
  │
  └── 検索バー入力 → [Search] (多言語全文検索 + フィルタ + ソート)
```

### リーダー画面レイアウト
```
┌──────────────────────────────────────────────────┐
│ ← Back    Title    [VI] [EN] [JA]    [PDF DL]   │
├──────┬────────────────────┬──────────────────────┤
│ TOC  │  Vietnamese (Left) │  EN or JA (Right)    │
│      │                    │                      │
│      │  ← scroll sync →  │                      │
│      │                    │                      │
└──────┴────────────────────┴──────────────────────┘
```

- TOC: 章・条の見出しを自動生成（h1 → 章、h2 → 条）
- 分割比率: ドラッグハンドルで調整可能
- スクロール同期: 左右パネルの対応セクション同期

### 3.1 ルーティング要件（静的配信前提）
- 静的ホスティング互換のため、ルーティングは `HashRouter` 相当または状態ベース遷移を採用する
- `BrowserRouter` 相当（`pushState`）は、404 フォールバック保証がある場合のみ許可

### 3.2 閲覧・操作機能要件（GlobalNotice VN 統合）
- Notice/List 表示はページネーションまたは無限スクロールに対応
- クライアントサイド検索・フィルタ（キーワード / 日付 / カテゴリ）を提供
- Detail View は Markdown/Text の本文表示に対応
- PDF 表示は埋め込みビューアを基本とし、互換性問題時は `iframe` またはダウンロードリンクへフォールバック
- オフライン時に既読コンテンツを再表示できるよう、メタデータや本文のキャッシュを保持する
- 設定/デバッグとして、ログエクスポート機能とバージョン表示を提供する

---

## 4. Error Handling（エラー処理仕様）

| エラー種別 | 処理 |
|-----------|------|
| MD ファイル fetch 失敗 (404) | 該当言語パネルに「Translation not available」表示 |
| Firestore 読み取り失敗 | 「アクセスできません。再度ログインしてください」表示 |
| Firebase Auth 失敗 | ポップアップブロック時は手動リトライを促す |
| 非 VJU ドメインでログイン | Access Denied モーダル + 「別のアカウントでログイン」ボタン |
| marked.js パースエラー | 生テキストをそのまま表示 |
| PDF ビューア互換性不良 | `iframe` 表示またはダウンロードリンクへフォールバック |
| ネットワーク失敗（再試行対象） | 指数バックオフで再試行（ただし 404 / Rate Limit は即停止） |

---

## 5. YAML Front Matter 処理

### `parseFrontMatter(text)`
- `---` で囲まれた YAML ブロックを抽出
- key-value をオブジェクトとして返却
- `restricted` フィールドの `true` / `false` を boolean 型に変換

### `stripFrontMatter(text)`
- YAML ブロック（`---` ～ `---`）を除去し、本文のみ返却
- YAML が存在しない場合はテキストをそのまま返却

---

## 6. Non-Functional Requirements（非機能要件）

### 6.1 Performance
- 独立リソース取得は `Promise.all` で並列化する
- PDF 関連コンポーネントは必要時のみ遅延ロードする

### 6.2 Reliability
- 主要 UI は `ErrorBoundary` 相当で保護し、全体クラッシュを避ける
- ネットワーク再試行は指数バックオフを使う
- `404` および Rate Limit エラー時は再試行を停止する

### 6.3 UX
- 一時的な成功/失敗通知は Toast を優先する
- モーダルの多用を避け、可能な範囲でインライン表示を優先する

### 6.4 Security
- クライアントコードに API キー / PAT / シークレットを含めない
- Markdown レンダリング時は安全な既定値を用い、HTML を扱う場合はサニタイズする
