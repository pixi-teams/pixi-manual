# pixi-manual プロジェクトルール

## プロジェクト概要

Markdown を正本とした pixi の静的マニュアルサイト。
Next.js (App Router / static export) + Tailwind CSS v4 + next-mdx-remote で構築。
ロール別（customer / cast / admin）に入口 URL を分け、Playwright で PDF を生成する。
UI は 3 カラム docs レイアウト（左サイドバー + 本文 + 右 PageToc）で、
Pagefind によるクライアント検索・ダークモード・パンくず・前後ページ送りを備える。

### デザイン方針（Notion 風・完全モノトーン）

デザインの正本は **`DESIGN.md`**（設計原則 + デザイントークン定義）。UI 変更時は必ず参照する。

地(chrome)もアクセントも **無彩色（温かい中立グレー）** で統一する。文字色は `#37352F` 系。
ロール（customer / cast / admin）は **色で区別せず**、ラベル・パンくず・URL で識別する。
かつてのロール別ブランド色（ティール/ピンク/インディゴ）と `data-role` によるアクセント切替は **撤廃済み**。
`data-role` 属性はマークアップに残るが `--accent` は切り替えない。

## コーディング規約

### TypeScript

- 関数はアロー関数式で定義する（`const fn = () => {}` 形式）
- function 宣言は使わない
- JSDoc コメントを関数・定数に付与する（`@param` / `@returns` を含む）
- `export` が必要な場合は `export const` で宣言する
- 型は明示的に付与する（戻り値・引数）

### React コンポーネント

- サーバーコンポーネントを優先する（`"use client"` は必要な場合のみ）
- コンポーネントはアロー関数式で定義する
- Props は interface で定義する
- ファイル名は PascalCase（例: `MdxContent.tsx`）

### Markdown コンテンツ

- 配置先: `content/docs/{セクションディレクトリ}/{連番}-{スラッグ}.md`
- ファイル名の連番が表示順を決定する
- 見出しルール: H1 = 記事タイトル, H2 = 機能/セクション（右 PageToc に載る）, H3 = 手順
- テンプレート構成: できること → 事前準備 → 手順 → 確認ポイント → よくあるミス
- スクリーンショット: 基本、全手順に添える。保管先は
  `public/manuals/{role}/{section}/{slug}/{連番}-説明.png`。
  MDX 内から `<Figure src="/manuals/..." alt="..." caption="..." />` で表示（src 省略時は準備中枠）。
  通常の Markdown 画像記法でも可（prose の img でフレーム表示）。
- 注意/ヒント: `<Callout type="warning|tip|note|step">...</Callout>` を利用できる（MdxContent の components に登録済み）。
- ⚠ basePath 対応: 画像は `<Figure>`（basePath を自動付与）を推奨。素の `<img src="/...">` は GitHub Pages のサブパスで壊れる。

### スタイル

- Tailwind CSS v4（`@theme inline` でセマンティックカラーを定義）。トークンの正本は `DESIGN.md`
- 色はハードコードせず変数を使う: 地は `--color-surface/-2/-3`・`--color-fg`・`--color-muted`・`--color-line`、
  アクセントは無彩色単一の `--color-accent`（= `--accent`）・`--color-accent-ink`・`--color-accent-soft`
- 本文は `prose-manual` クラス（すべて上記変数参照）。見出しに装飾バー・下線は付けない
- 影は原則不使用（オーバーレイのみ `--shadow`）。角丸は 4/6/8/10px。絵文字は UI に使わず SVG アイコンで
- ダークモードは `html.dark` クラス + `@custom-variant dark`。初期適用は layout.tsx の inline スクリプト（FOUC 回避）
- 印刷用スタイルは `@media print`、`@custom-variant print` も定義済み

## アーキテクチャ

- `src/lib/mdx.ts` — Markdown 読込、ロール定義（`roles`/`roleSections`/`sectionLabels`）、
  記事取得（`getDoc`/`getRoleDocs`/`getAdjacentDocs`）、ナビ構築（`getRoleNav`）、
  見出し抽出（`extractHeadings`）、静的パラメータ（`getAllDocParams`）
- `src/components/AppShell.tsx` — TopBar + 左サイドバー + 本文 + 右 PageToc の 3 カラム枠
- `src/components/` — TopBar / SidebarNav / PageToc / Breadcrumbs / PrevNext / SearchDialog /
  ThemeToggle / Callout / Figure / MdxContent
- ルート（すべて `generateStaticParams` で静的化）:
  - `src/app/docs/[role]/page.tsx` — ロール別目次
  - `src/app/docs/[role]/[section]/[slug]/page.tsx` — 個別記事（AppShell 使用）
  - `src/app/docs/[role]/book/page.tsx` — 1冊ビュー（PDF 生成対象・クロームなし）
- 検索: `pnpm build` の後段で `pagefind --site out` がインデックス生成。
  クライアントは `${NEXT_PUBLIC_BASE_PATH}/pagefind/pagefind.js` を動的 import（dev では未生成なので無効）

### セクション/記事追加時の変更箇所

1. `content/docs/` に新ディレクトリ + Markdown を追加（記事追加だけならこれだけ。ナビ・ルートは自動反映）
2. 新セクションを増やす場合のみ `src/lib/mdx.ts` の `roleSections` と `sectionLabels` を更新

## Git 運用

- ブランチ: `feature/docs-xxxx`
- タグ: `manual-vX.Y.Z`（SemVer: MAJOR=UI変更, MINOR=章追加, PATCH=軽微修正）
- タグ push で GitHub Actions が PDF を自動生成し Release に添付
