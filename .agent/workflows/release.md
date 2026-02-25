---
description: リリースタグを作成して PDF を配布するワークフロー
---

# リリース

## リリース前チェック

1. main ブランチが最新であることを確認する
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && git status && git log --oneline -5
```

2. ビルドが通ることを確認する
// turbo
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && pnpm build
```

## SemVer ルール

タグは `manual-vX.Y.Z` 形式で作成する:

- **MAJOR (X)**: UI レイアウト変更、ロール構成変更
- **MINOR (Y)**: 章の追加、セクション追加
- **PATCH (Z)**: 誤字修正、軽微な文言修正

## タグの作成

1. 適切なバージョン番号を決定する（上記 SemVer ルール参照）
2. タグを作成して push する
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && git tag manual-vX.Y.Z && git push origin manual-vX.Y.Z
```
3. GitHub Actions が自動で:
   - Next.js をビルド
   - Playwright で 3 種の PDF を生成（customer / cast / admin）
   - GitHub Release に PDF を添付
4. Release ページから PDF をダウンロードして営業配布する
