# pixi マニュアル — ブランチ戦略とリリースフロー

## ブランチ戦略

### main ブランチ
- **常に最新の公開可能な状態**を維持する
- 直接コミットは原則禁止
- Pull Request 経由でのマージのみ

### feature ブランチ
- 命名規則: `feature/docs-xxxx`
- 例:
  - `feat/docs-reservation-cancel`
  - `feat/docs-cast-schedule`
  - `feat/docs-admin-analytics`

### ブランチ運用フロー

```
main ← PR ← feature/docs-xxxx
```

1. `main` から `feature/docs-xxxx` を切る
2. Markdown の追加・修正を行う
3. Pull Request を作成し、レビューを受ける
4. main にマージ

---

## タグとリリース

### タグ命名規則

```
manual-vX.Y.Z
```

### SemVer ルール

| バージョン | 変更内容 | 例 |
|-----------|---------|-----|
| **MAJOR** (X) | UIレイアウト変更、ロール構成変更 | `manual-v2.0.0` |
| **MINOR** (Y) | 章の追加、セクション追加 | `manual-v1.1.0` |
| **PATCH** (Z) | 誤字修正、軽微な文言修正 | `manual-v1.0.1` |

---

## 営業配布フロー

```
1. main ブランチで内容を確定
       ↓
2. タグを作成: manual-v1.0.0
       ↓
3. GitHub Actions が自動実行
   - Next.js ビルド
   - Playwright で PDF 生成（customer / cast / admin）
       ↓
4. GitHub Release に PDF が自動添付
       ↓
5. Release ページから PDF をダウンロードして営業配布
```

### タグ作成コマンド

```bash
git tag manual-v1.0.0
git push origin manual-v1.0.0
```

### 生成される PDF

| ファイル名 | 対象ロール |
|-----------|-----------|
| `pixi-manual-customer.pdf` | お客様向け |
| `pixi-manual-cast.pdf` | キャスト向け |
| `pixi-manual-admin.pdf` | 管理者向け |

---

## リリースチェックリスト

- [ ] Markdown の内容が最新であること
- [ ] ローカルでビルドが通ること (`pnpm build`)
- [ ] ローカルで PDF が生成できること
- [ ] main ブランチにマージ済みであること
- [ ] タグの SemVer が適切であること
