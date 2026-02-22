# Spec.md — VJU Document Repository

> **最終更新:** 2026-02-21

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

**department 値:**
| 値 | 説明 |
|----|------|
| `Academic Affairs` | 教務 |
| `Financial Affairs` | 財務 |
| `Quality Assurance` | 品質保証 |
| `General Affairs` | 総務 |

**type 値:**
| 値 | 説明 |
|----|------|
| `Regulation` | 規則・規程 |
| `Circular` | 通達 |
| `Guideline` | ガイドライン・手引き |
| `Notification` | 通知 |
| `Decree` | 政令 |
| `Decision` | 決定 |
| `Report` | 報告書 |

### 1.2 DOC_REGISTRY（index.html 内）
```js
const DOC_REGISTRY = {
  '3626-QD-DHQGHN': '3626-QD-DHQGHN_Regulation on Undergraduate Training',
  '3636-QD-DHQGHN': '3636-QD-DHQGHN_Regulation on Masters Training',
  '3638-QD-DHQGHN': '3638-QD-DHQGHN_Regulation on Doctoral Training',
  // ... 追加文書
};
```

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

---

## 3. Interface Rules（画面と状態遷移）

### ビュー遷移
```
[Home]
  │ カード選択
  ├── 公開文書 → [Reader] (fetch from GitHub Pages)
  └── 制限文書 →
        ├── 未ログイン → [Login Modal] → Google Auth → [Reader]
        ├── VJU メンバー → [Reader] (fetch from Firestore)
        └── 外部ユーザー → [Access Denied Modal]
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

---

## 4. Error Handling（エラー処理仕様）

| エラー種別 | 処理 |
|-----------|------|
| MD ファイル fetch 失敗 (404) | 該当言語パネルに「Translation not available」表示 |
| Firestore 読み取り失敗 | 「アクセスできません。再度ログインしてください」表示 |
| Firebase Auth 失敗 | ポップアップブロック時は手動リトライを促す |
| 非 VJU ドメインでログイン | Access Denied モーダル + 「別のアカウントでログイン」ボタン |
| marked.js パースエラー | 生テキストをそのまま表示 |

---

## 5. YAML Front Matter 処理

### `parseFrontMatter(text)`
- `---` で囲まれた YAML ブロックを抽出
- key-value をオブジェクトとして返却
- `restricted` フィールドの `true` / `false` を boolean 型に変換

### `stripFrontMatter(text)`
- YAML ブロック（`---` ～ `---`）を除去し、本文のみ返却
- YAML が存在しない場合はテキストをそのまま返却
