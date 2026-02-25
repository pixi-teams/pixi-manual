# pixi-manual プロジェクトルール

## プロジェクト概要

Markdown を正本とした pixi の静的マニュアルサイト。
Next.js (App Router) + Tailwind CSS v4 + next-mdx-remote で構築。
ロール別（customer / cast / admin）に入口 URL を分け、Playwright で PDF を生成する。

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
- 見出しルール: H1 = 章, H2 = 機能, H3 = 手順
- テンプレート構成: できること → 事前準備 → 手順 → 確認ポイント → よくあるミス

### スタイル

- Tailwind CSS v4（`@theme inline` でカスタムプロパティを定義）
- `prose-manual` クラスで Markdown 本文のスタイルを制御
- 印刷用スタイルは `@media print` で globals.css に直接記述
- Tailwind v4 の `@custom-variant print` を定義済み

## アーキテクチャ

- `src/lib/mdx.ts` — Markdown 読込・ロール別セクション定義
- `src/components/` — 再利用可能な UI コンポーネント
- `src/app/docs/{role}/page.tsx` — ロール別目次ページ
- `src/app/docs/{role}/book/page.tsx` — 1冊ビュー（PDF 生成対象）

### セクション追加時の変更箇所

1. `content/docs/` に新ディレクトリ + Markdown を追加
2. `src/lib/mdx.ts` の `roleSections` と `sectionLabels` を更新

## Git 運用

- ブランチ: `feature/docs-xxxx`
- タグ: `manual-vX.Y.Z`（SemVer: MAJOR=UI変更, MINOR=章追加, PATCH=軽微修正）
- タグ push で GitHub Actions が PDF を自動生成し Release に添付
