# pixi マニュアルサイト — アーキテクチャ

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4 |
| Markdown レンダリング | next-mdx-remote/rsc + remark-gfm |
| PDF 生成 | Playwright |
| パッケージマネージャー | pnpm |
| CI/CD | GitHub Actions |
| ホスティング | 静的出力（SSG） |

## ディレクトリ構成

```
pixi-manual/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # ロール選択トップページ
│   │   ├── globals.css          # グローバルスタイル
│   │   └── docs/
│   │       ├── layout.tsx       # ドキュメント共通レイアウト
│   │       ├── customer/
│   │       │   ├── page.tsx     # 目次
│   │       │   └── book/page.tsx # 1冊ビュー（PDF対象）
│   │       ├── cast/
│   │       │   ├── page.tsx
│   │       │   └── book/page.tsx
│   │       └── admin/
│   │           ├── page.tsx
│   │           └── book/page.tsx
│   ├── components/
│   │   ├── MdxContent.tsx       # MDXレンダリング
│   │   └── TableOfContents.tsx  # 目次コンポーネント
│   └── lib/
│       └── mdx.ts               # Markdown読込ユーティリティ
├── content/
│   └── docs/
│       ├── 10-web-reservation/  # Web予約
│       ├── 20-cast-management/  # キャスト管理
│       └── 30-admin/            # 管理機能
├── public/manuals/              # PDF出力先
├── scripts/
│   └── generate-pdf.ts          # PDF生成スクリプト
├── docs/
│   ├── architecture.md          # 本ファイル
│   └── branching-and-release.md # ブランチ・リリース戦略
└── .github/workflows/
    └── generate-pdf.yml         # PDF生成CI
```

## レンダリングフロー

```
content/docs/*.md
       ↓
  lib/mdx.ts (gray-matter + fs)
       ↓
  ロール別にセクション選択
       ↓
  MdxContent.tsx (next-mdx-remote/rsc + remark-gfm)
       ↓
  目次ページ / Book ページ
       ↓
  SSG で静的 HTML 出力
       ↓
  Playwright で Book ページを PDF 化
```

## ロール別セクション対応表

| ロール | Web予約 | キャスト管理 | 管理機能 |
|--------|---------|-------------|---------|
| customer | ✅ | - | - |
| cast | ✅ | ✅ | - |
| admin | ✅ | ✅ | ✅ |

## 拡張ポイント

### 検索機能
- `content/docs/` 配下の Markdown をビルド時にインデックス化し、
  FlexSearch 等のクライアントサイド検索を追加可能。

### AI 統合
- Markdown ファイルは構造化されているため、
  RAG（Retrieval-Augmented Generation）のソースとして利用可能。
- 各ファイルの frontmatter にメタデータを追加してベクトル検索に対応可能。

### 多言語化
- `content/docs/` を `content/docs/ja/`, `content/docs/en/` のように
  言語ディレクトリで分割し、`lib/mdx.ts` のパスを動的に切替える。

### 個別ドキュメントページ
- 現状は目次+Bookビューの2種だが、
  `app/docs/[role]/[slug]/page.tsx` を追加すれば個別記事ページも実装可能。
