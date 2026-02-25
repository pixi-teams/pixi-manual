---
description: PDF を生成するワークフロー
---

# PDF 生成

// turbo-all

## ローカルで PDF を生成する

1. Next.js をビルドする
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && pnpm build
```

2. 静的ファイルサーバーを起動する
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && npx -y serve out -l 3000 &
```

3. サーバーの起動を待つ
```bash
sleep 3
```

4. Playwright ブラウザをインストールする（初回のみ）
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && pnpm exec playwright install chromium
```

5. PDF を生成する
```bash
cd /Users/terada/Desktop/work/pixi/pixi-manual && pnpm exec tsx scripts/generate-pdf.ts
```

6. サーバーを停止する
```bash
pkill -f "serve out"
```

7. 生成された PDF を確認する
```bash
ls -la /Users/terada/Desktop/work/pixi/pixi-manual/public/manuals/
```

## CI で PDF を生成する場合

1. main ブランチにマージ済みであることを確認する
2. タグを作成して push する
```bash
git tag manual-vX.Y.Z
git push origin manual-vX.Y.Z
```
3. GitHub Actions が自動で PDF を生成し、Release に添付する
