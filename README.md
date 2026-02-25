# pixi マニュアル

Markdown を正本（Git 管理）とした、pixi の静的マニュアルサイトです。  
ロール別（お客様 / キャスト / 管理者）に入口 URL を分け、営業配布用に PDF を自動生成できます。

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4 |
| Markdown レンダリング | next-mdx-remote / remark-gfm |
| PDF 生成 | Playwright |
| パッケージマネージャー | pnpm |
| 出力形式 | SSG（`output: "export"`） |

---

## ディレクトリ構成

```
pixi-manual/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップ（ロール選択）
│   │   ├── globals.css             # グローバル + 印刷用 CSS
│   │   └── docs/
│   │       ├── layout.tsx          # ドキュメント共通レイアウト
│   │       ├── customer/
│   │       │   ├── page.tsx        # 目次
│   │       │   └── book/page.tsx   # 1冊ビュー（PDF対象）
│   │       ├── cast/
│   │       │   ├── page.tsx
│   │       │   └── book/page.tsx
│   │       └── admin/
│   │           ├── page.tsx
│   │           └── book/page.tsx
│   ├── components/
│   │   ├── MdxContent.tsx          # MDX レンダラー
│   │   └── TableOfContents.tsx     # 目次コンポーネント
│   └── lib/
│       └── mdx.ts                  # Markdown 読込ユーティリティ
│
├── content/docs/                   # ★ Markdown 正本
│   ├── 10-web-reservation/         # Web予約
│   ├── 20-cast-management/         # キャスト管理
│   └── 30-admin/                   # 管理機能
│
├── public/manuals/                 # PDF 出力先
├── scripts/
│   └── generate-pdf.ts             # Playwright PDF 生成スクリプト
├── docs/
│   ├── architecture.md             # アーキテクチャ設計
│   └── branching-and-release.md    # ブランチ・リリース戦略
└── .github/workflows/
    └── generate-pdf.yml            # PDF 自動生成ワークフロー
```

---

## ロール別セクション対応表

| ロール | URL | Web予約 | キャスト管理 | 管理機能 |
|--------|-----|---------|-------------|---------|
| お客様 | `/docs/customer` | ✅ | — | — |
| キャスト | `/docs/cast` | ✅ | ✅ | — |
| 管理者 | `/docs/admin` | ✅ | ✅ | ✅ |

ロール別のセクション割り当ては `src/lib/mdx.ts` の `roleSections` で管理しています。

---

## セットアップ

```bash
pnpm install
```

## ローカル開発

```bash
pnpm dev
# → http://localhost:3000
```

## 静的ビルド

```bash
pnpm build
# → out/ ディレクトリに静的 HTML が出力される
```

## PDF 生成（ローカル）

```bash
# 1. ビルド & サーバー起動
pnpm build
npx -y serve out -l 3000 &

# 2. Playwright ブラウザインストール（初回のみ）
pnpm exec playwright install chromium

# 3. PDF 生成
pnpm exec tsx scripts/generate-pdf.ts
# → public/manuals/pixi-manual-{customer,cast,admin}.pdf
```

---

## マニュアルの追加・編集フロー

### 1. 既存セクションに記事を追加する

`content/docs/` 配下の対象セクションディレクトリに Markdown ファイルを追加します。

```bash
# 例: Web予約セクションに「キャンセルポリシー」を追加
touch content/docs/10-web-reservation/03-cancel-policy.md
```

**ファイル名ルール:**
- `{連番}-{スラッグ}.md` の形式（例: `03-cancel-policy.md`）
- 連番がそのまま章内の表示順となる

**Markdown テンプレート:**

```markdown
# （機能名）

## できること
- 

## 事前準備
- 

## 手順
1.
2.
3.

## 確認ポイント
- 

## よくあるミス
- 
```

> 見出しルール: **H1 = 章**, **H2 = 機能**, **H3 = 手順**

追加後、dev サーバーを再起動すれば自動的に目次・Book View に反映されます。

### 2. 新しいセクション（章）を追加する

```bash
# 1. セクションディレクトリを作成
mkdir content/docs/40-analytics

# 2. Markdown ファイルを追加
touch content/docs/40-analytics/01-dashboard.md
```

次に `src/lib/mdx.ts` を編集して、新セクションをロールに紐付けます。

```typescript
// roleSections にセクションを追加
export const roleSections: Record<string, string[]> = {
  customer: ["10-web-reservation"],
  cast: ["10-web-reservation", "20-cast-management"],
  admin: ["10-web-reservation", "20-cast-management", "30-admin", "40-analytics"], // ← 追加
};

// sectionLabels に表示名を追加
export const sectionLabels: Record<string, string> = {
  "10-web-reservation": "Web予約",
  "20-cast-management": "キャスト管理",
  "30-admin": "管理機能",
  "40-analytics": "分析・レポート", // ← 追加
};
```

### 3. リリースして PDF を配布する

```bash
# 1. feature ブランチで作業 → main にマージ
git checkout -b feat/docs-analytics
# ... 編集 ...
git push origin feat/docs-analytics
# → PR 作成 → レビュー → main にマージ

# 2. タグを打つと CI が自動で PDF を生成
git tag manual-v1.1.0
git push origin manual-v1.1.0
# → GitHub Release に PDF が添付される
```

**SemVer ルール:**

| バージョン | 変更内容 | 例 |
|-----------|---------|-----|
| MAJOR | UI レイアウト変更、ロール構成変更 | `manual-v2.0.0` |
| MINOR | 章の追加、セクション追加 | `manual-v1.1.0` |
| PATCH | 誤字修正、軽微な文言修正 | `manual-v1.0.1` |

---

## 関連ドキュメント

- [architecture.md](docs/architecture.md) — 技術的な設計詳細・拡張ポイント
- [branching-and-release.md](docs/branching-and-release.md) — ブランチ戦略・リリースフロー詳細
