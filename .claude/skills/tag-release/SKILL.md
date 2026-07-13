---
name: tag-release
description: pixi-manual で新しいバージョンをリリースする(= main に `manual-vX.Y.Z` タグを作成・push して、GitHub Actions の PDF 生成と GitHub Release を発火させる)ための手順スキル。「タグを打つ」「リリースする」「新しいバージョンを出す」「manual-v… を切る」などと言われたときに使う。タグ push は不可逆なので、push の直前に必ず確認を取る。
---

# pixi-manual タグ打ち（リリース）手順

pixi-manual は **main に `manual-vX.Y.Z` タグを push すると**、`.github/workflows/generate-pdf.yml`
が発火して customer / cast / admin の PDF を生成し、GitHub Release に自動添付する。
このスキルは、前提チェック → 次バージョン算出 → 確認 → タグ作成 → push を安全に進めるための手順書。

**このスキルは pixi-manual リポジトリ専用。** cwd が pixi-manual でなければ実行しない。

## 引数

```
/tag-release [patch|minor|major|manual-vX.Y.Z]
```

- `patch` / `minor` / `major`: 最新タグからその種別で繰り上げる。
- `manual-vX.Y.Z`: バージョンを明示指定する。
- 省略時: 前タグ以降の変更内容から種別を推定して提案する（確定はユーザー確認で行う）。

## SemVer の意味づけ（`docs/branching-and-release.md` が正本）

| 種別 | 上げる条件 | 例 |
|------|-----------|-----|
| **MAJOR** | UIレイアウト変更・ロール構成変更 | `manual-v2.0.0` |
| **MINOR** | 章・セクションの追加 | `manual-v1.1.0` |
| **PATCH** | 誤字修正・軽微な文言修正 | `manual-v1.0.1` |

## 手順

### 0. リポジトリ確認
- cwd が pixi-manual か確認する（`content/docs/` と `.github/workflows/generate-pdf.yml` が存在し、`package.json` の name が pixi-manual 系）。
- 違えば「このスキルは pixi-manual 専用です」と伝えて中止する。

### 1. 前提チェック（fail-fast・結果を明示）
以下を順に確認し、1つでも満たさなければ**理由を説明して中止**する（勝手に修正・commit・push しない）。

1. リモートとタグを取得: `git fetch origin --tags`
2. 現在ブランチが `main` であること（`git branch --show-current`）。
   - main でなければ「pixi-manual のタグは main で打つ規約です」と伝え、`git switch main` してよいかユーザーに確認する。勝手に切り替えない。
3. 作業ツリーがクリーンであること（`git status --porcelain` が空）。
   - 未コミットの変更があれば中止し、コミット/退避を促す。
4. ローカル main がリモートと一致していること（`git rev-parse HEAD` と `git rev-parse origin/main` が同じ）。
   - 遅れている/進んでいる場合は `git pull` / push 済み PR のマージ状況を確認するよう促して中止する。タグは push 済みの main コミットを指す必要がある。
5. リリース準備: `pnpm build` が通ること（チェックリスト必須項目）。
   - 失敗したら中止し、内容を報告する。
   - PDF のローカル生成確認（`scripts/generate-pdf.ts`、Playwright 使用）は重いので既定ではスキップ。ユーザーが希望した場合のみ案内する。

### 2. 次バージョンの算出
1. 最新タグを取得: `git tag --list 'manual-v*' | sort -V | tail -1`（実績が無ければ `manual-v0.1.0` を初回候補にする）。
2. 引数に応じて次バージョンを決める:
   - 明示バージョン: 形式（`manual-v` + `X.Y.Z`）を検証し、既存でないことを確認する。
   - `patch` / `minor` / `major`: 最新タグの該当桁を +1（下位桁は 0 リセット）。例: 最新 `manual-v0.1.8` → patch=`manual-v0.1.9` / minor=`manual-v0.2.0` / major=`manual-v1.0.0`。
   - 省略時: `git log <最新タグ>..HEAD --oneline` を見て、上の SemVer 表に沿って種別を推定し提案する。
3. 新タグが未使用であること: `git rev-parse -q --verify "refs/tags/<新タグ>"` が何も返さない（= 存在しない）ことを確認する。既に在れば別バージョンにする。

### 3. タグメッセージの下書き
- `git log <最新タグ>..HEAD --oneline` の内容を、日本語で簡潔なリリースノートに要約する（主な追加・変更を箇条書き）。

### 4. 確認ゲート（必須・不可逆）
push は取り消しにくく、push 即 CI（PDF生成 + Release 作成）が走る。**次を提示してユーザーの明示的な許可を得るまで、タグ作成・push はしない。**
- 作成する新タグ名（例 `manual-v0.1.9`）
- 指す対象コミット（`git rev-parse --short HEAD` の SHA と件名）
- 選んだ種別（patch/minor/major）とその理由
- 前タグ以降の変更サマリ（手順3の下書き）
- 「push すると PDF 生成と GitHub Release が自動で走る」旨

### 5. タグ作成 & push
確認が取れたら実行する:
```bash
git tag -a <新タグ> -m "<リリースノート>"
git push origin <新タグ>
```

### 6. 事後案内
- CI の進捗を案内する: `gh run list --workflow=generate-pdf.yml -L 3` / `gh run watch`
- 完了後の Release 確認: `gh release view <新タグ> --web`
- 生成される PDF: `pixi-manual-customer.pdf` / `pixi-manual-cast.pdf` / `pixi-manual-admin.pdf`（Release からダウンロードして営業配布）。

## 安全上の注意
- 既存タグは**削除・移動しない**。push 済みタグを付け替えると履歴が壊れ、CI も再発火する。
- リリース内容の誤りは、タグを force-move せず**新しい PATCH タグ**を切って修正する。
- 前提チェックで問題が出たら、勝手に直さず状況を報告してユーザーの判断を仰ぐ。
