/**
 * 管理画面（pixi-admin）のスクリーンショットを撮影して public/manuals/admin/ に保存する。
 *
 * 撮影対象は SHOTS に宣言的に並べる。UI が変わったら、その項目の prepare を直して
 * `pnpm shots:admin -- <slug>` で必要な分だけ撮り直す。
 *
 * ⚠ 必ず **origin/develop の最新** を撮ること（apollon-admin は役目を終えて remote から消えている）。
 *    ローカルの作業ツリーは別ブランチ・古い状態のことがあり、実際とは違う画面が撮れる。
 *    作業ツリーを汚さずに最新を用意するには worktree を使う:
 *
 *      cd ../pixi-admin
 *      git fetch origin develop
 *      git worktree add ../.worktrees/manual-shots --detach origin/develop
 *      cd ../.worktrees/manual-shots
 *      cp ../../pixi-admin/.env.local .          # NEXT_PUBLIC_API_MOCKING=enabled
 *      git submodule update --init apollon-swagger
 *      pnpm install && pnpm api:generate         # src/lib/api は生成物で未追跡
 *      pnpm dev -p 3003
 *
 * ⚠ MSW は NODE_ENV=development でしかモックしないため、撮影は必ず `pnpm dev` で行う
 *   （`pnpm build && pnpm start` ではログインが「通信エラー」になる）。
 *
 * ⚠ dev の初回コンパイルは 1 ルートあたり数十秒〜数分かかる。撮影前にログイン済みの
 *   ブラウザで対象ルートを一巡して温めておかないと、goto が 30 秒で落ちる。
 *
 * 撮影:
 *      pnpm shots:admin              # 全件
 *      pnpm shots:admin -- 01-login  # slug に部分一致するものだけ
 *
 * 環境変数:
 *   ADMIN_URL        管理画面の URL（既定 http://localhost:3003）
 *   ADMIN_STORE_CODE / ADMIN_USER_ID / ADMIN_PASSWORD  モックのログイン情報
 */

import path from "path";
import fs from "fs";
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3003";

/** 撮影に使うモックアカウント */
interface Account {
  storeCode: string;
  userId: string;
  password: string;
}

/**
 * 既定は pro のオーナー（表示フラグ全 ON）。
 * 報酬・メッセージは ultra 限定なので、その画面だけ ultra で撮る。
 */
const ACCOUNTS: Record<"default" | "ultra", Account> = {
  default: {
    storeCode: process.env.ADMIN_STORE_CODE || "test-shop",
    userId: process.env.ADMIN_USER_ID || "staff_002",
    password: process.env.ADMIN_PASSWORD || "Sato@Owner99",
  },
  ultra: {
    storeCode: "test-shop-ultra",
    userId: "ultra@example.com",
    password: "password",
  },
};

const STORE_CODE = ACCOUNTS.default.storeCode;
const USER_ID = ACCOUNTS.default.userId;
const PASSWORD = ACCOUNTS.default.password;

const ROLE = "admin";
const OUTPUT_ROOT = path.join(process.cwd(), "public", "manuals", ROLE);

/** 撮影時のビューポート。管理画面は PC 前提なので横 1440px で揃える。 */
const VIEWPORT = { width: 1440, height: 900 };
/** 2 倍で撮る（A4 に 170mm 幅で置いても 400dpi 相当） */
const SCALE = 2;
/**
 * JPEG で保存する。PNG だと 1 枚 1MB を超え、60 枚超の PDF が数十 MB になってしまう。
 * 印刷は 2 倍解像度から縮小されるため、この品質なら劣化は見えない。
 */
const IMAGE_QUALITY = 88;

/**
 * モックのキャスト写真は実在の人物写真なので、外部配布物に載せない。
 * ネットワーク段で無地のアバターに差し替える（CSS より確実で、どの画面でも効く）。
 */
const PLACEHOLDER_AVATAR = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#dfe4ec"/>
  <circle cx="100" cy="78" r="34" fill="#b6bfcd"/>
  <path d="M100 122c-38 0-64 24-64 54v24h128v-24c0-30-26-54-64-54z" fill="#b6bfcd"/>
</svg>`;

/** Next.js の開発オーバーレイなど、マニュアルに写ってはいけない要素を隠す */
const HIDE_DEV_CHROME = `
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dev-tools-button],
  #__next-build-watcher { display: none !important; }
`;

/** 撮影 1 枚分の定義 */
interface Shot {
  /** content/docs のセクションディレクトリ名 */
  section: string;
  /** 記事のスラッグ（ファイル名から .md を除いたもの） */
  slug: string;
  /** 記事内での連番 */
  index: number;
  /** ファイル名に使う説明（英小文字・ハイフン） */
  name: string;
  /** 管理画面のパス */
  path: string;
  /** ログイン不要なら false（既定 true） */
  auth?: boolean;
  /** 既定以外のアカウントで撮る（報酬・メッセージなど ultra 限定画面） */
  account?: keyof typeof ACCOUNTS;
  /** この要素だけを撮る（省略時はビューポート全体） */
  selector?: string;
  /** 縦に長い画面を 1 枚に収めたいときだけ、このショットの高さを上書きする */
  viewportHeight?: number;
  /** 撮影前の操作 */
  prepare?: (page: Page) => Promise<void>;
}

/** 指定ミリ秒待つ（アニメーション・遅延読み込みの落ち着き待ち） */
const settle = (page: Page, ms = 700): Promise<void> => page.waitForTimeout(ms);

const SHOTS: Shot[] = [
  // ---------------- 30-admin-basics ----------------
  {
    section: "30-admin-basics",
    slug: "01-login",
    index: 1,
    name: "login-form",
    path: "/login",
    auth: false,
    prepare: async (page) => {
      await page.fill('input[name="storeCode"]', STORE_CODE);
      await page.fill('input[name="emailAddress"]', USER_ID);
      await page.fill('input[name="password"]', PASSWORD);
      await settle(page, 300);
    },
  },
  {
    section: "30-admin-basics",
    slug: "01-login",
    index: 2,
    name: "social-login",
    path: "/login",
    auth: false,
    prepare: async (page) => {
      // ソーシャルログインでも Store Code は必須。その状態を見せる。
      await page.fill('input[name="storeCode"]', STORE_CODE);
      await settle(page, 300);
    },
  },
  {
    section: "30-admin-basics",
    slug: "01-login",
    index: 3,
    name: "forgot-password",
    path: "/forgot-password",
    auth: false,
  },
  {
    section: "30-admin-basics",
    slug: "02-roles-and-plans",
    index: 1,
    name: "sidebar-menu",
    path: "/dashboard",
    // メニューだけを切り出すと縦長すぎて紙面に載らないので画面全体で撮る。
    // 既定の高さだとメニュー下部（請求・料金システム）が切れるため縦を伸ばす。
    viewportHeight: 1080,
  },
  {
    section: "30-admin-basics",
    slug: "03-dashboard",
    index: 1,
    name: "dashboard-top",
    path: "/dashboard",
  },
  {
    section: "30-admin-basics",
    slug: "03-dashboard",
    index: 2,
    name: "store-guide-filter",
    path: "/dashboard",
    prepare: async (page) => {
      // 「エリア」の選択欄を開いた状態を見せる（ラベルの直後のボタン）
      await page
        .locator('span:text-is("エリア")')
        .locator("xpath=..")
        .locator("button")
        .first()
        .click();
      await settle(page);
    },
  },
  {
    section: "30-admin-basics",
    slug: "03-dashboard",
    index: 3,
    name: "summary-cards",
    path: "/dashboard",
    prepare: async (page) => {
      // 「店落ち」のまとめカードは画面下部にあるのでスクロールして収める
      await page.getByText("店落ち").first().scrollIntoViewIfNeeded();
      await settle(page);
    },
  },
  {
    section: "30-admin-basics",
    slug: "04-mypage-notifications",
    index: 1,
    name: "mypage-top",
    path: "/mypage",
  },
  {
    section: "30-admin-basics",
    slug: "04-mypage-notifications",
    index: 2,
    name: "account-section",
    path: "/mypage",
    prepare: async (page) => {
      // ヘッダーのアカウントメニューではなく、カード内のアコーディオンを開く
      await page.getByRole("button", { name: "アカウント" }).last().click();
      await settle(page);
    },
  },
  {
    section: "30-admin-basics",
    slug: "04-mypage-notifications",
    index: 3,
    name: "notification-settings",
    path: "/mypage",
    prepare: async (page) => {
      // ヘッダーのベルにも「通知」の名前が付くので、後ろにあるアコーディオンを選ぶ
      await page.getByRole("button", { name: "通知" }).last().click();
      await settle(page);
    },
  },
  {
    section: "30-admin-basics",
    slug: "04-mypage-notifications",
    index: 4,
    name: "notification-dropdown",
    path: "/dashboard",
    prepare: async (page) => {
      // ヘッダーのベル（未読件数バッジ付きのボタン）を開く
      await page
        .locator("header button, [class*=header] button")
        .last()
        .click();
      await settle(page);
    },
  },

  // ---------------- 40-admin-operations ----------------
  {
    section: "40-admin-operations",
    slug: "01-reservation-list",
    index: 1,
    name: "today-reservations",
    path: "/reservations",
  },
  {
    section: "40-admin-operations",
    slug: "01-reservation-list",
    index: 2,
    name: "reservation-table",
    path: "/reservations",
    prepare: async (page) => {
      await page
        .getByText("予約一覧", { exact: true })
        .first()
        .scrollIntoViewIfNeeded();
      await settle(page);
    },
  },
  {
    section: "40-admin-operations",
    slug: "02-reservation-create",
    index: 1,
    name: "create-form",
    path: "/reservations/create",
  },
  {
    section: "40-admin-operations",
    slug: "02-reservation-create",
    index: 2,
    name: "price-breakdown",
    path: "/reservations/create",
    prepare: async (page) => {
      await page.getByText("料金内訳").first().scrollIntoViewIfNeeded();
      await settle(page);
    },
  },
  {
    section: "40-admin-operations",
    slug: "03-reservation-detail",
    index: 1,
    name: "detail-top",
    path: "/reservations/res_001",
  },
  {
    section: "40-admin-operations",
    slug: "03-reservation-detail",
    index: 2,
    name: "detail-bottom",
    path: "/reservations/res_001",
    prepare: async (page) => {
      await page.getByText("登録スタッフ").first().scrollIntoViewIfNeeded();
      await settle(page);
    },
  },
  {
    section: "40-admin-operations",
    slug: "04-schedule",
    index: 1,
    name: "schedule",
    path: "/schedule",
  },
  {
    section: "40-admin-operations",
    slug: "05-shifts",
    index: 1,
    name: "shifts",
    path: "/shifts",
  },
  {
    section: "40-admin-operations",
    slug: "06-reservation-form-settings",
    index: 1,
    name: "form-settings",
    path: "/reservations/form-settings",
  },

  // ---------------- 50-admin-management ----------------
  {
    section: "50-admin-management",
    slug: "01-casts",
    index: 1,
    name: "cast-list",
    path: "/casts",
  },
  {
    section: "50-admin-management",
    slug: "02-customers",
    index: 1,
    name: "customer-list",
    path: "/customers",
  },
  {
    section: "50-admin-management",
    slug: "03-staffs",
    index: 1,
    name: "staff-list",
    path: "/staffs",
  },
  {
    section: "50-admin-management",
    slug: "04-rooms",
    index: 1,
    name: "room-list",
    path: "/rooms",
  },

  // ---------------- 60-admin-accounting ----------------
  {
    section: "60-admin-accounting",
    slug: "01-report",
    index: 1,
    name: "report",
    path: "/report",
  },
  {
    section: "60-admin-accounting",
    slug: "02-salary",
    index: 1,
    name: "salary-list",
    path: "/salary",
    account: "ultra",
  },
  {
    section: "60-admin-accounting",
    slug: "03-expenses",
    index: 1,
    name: "expense-list",
    path: "/expenses",
  },
  {
    section: "60-admin-accounting",
    slug: "04-billing",
    index: 1,
    name: "billing-list",
    path: "/billing",
  },
  {
    section: "60-admin-accounting",
    slug: "05-pricing",
    index: 1,
    name: "pricing",
    path: "/pricing",
  },

  // ---------------- 70-admin-settings ----------------
  {
    section: "70-admin-settings",
    slug: "01-store-settings",
    index: 1,
    name: "store-settings",
    path: "/settings",
  },
  {
    section: "70-admin-settings",
    slug: "02-line-notification",
    index: 1,
    name: "line-settings",
    path: "/settings/line",
  },
];

/**
 * 実在人物のモック写真を無地アバターに差し替える。
 * Next.js の画像最適化を経由すると URL が /_next/image?url=%2FIMG_5888.png に
 * なるため、パス一致ではなく URL 全体の部分一致で判定する。
 * @param ctx ブラウザコンテキスト
 */
const maskCastPhotos = async (ctx: BrowserContext): Promise<void> => {
  await ctx.route(
    (url) => url.href.includes("IMG_5888"),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: PLACEHOLDER_AVATAR,
      }),
  );
};

/**
 * 利用規約・プライバシーポリシーの同意モーダルを閉じる。
 *
 * ログイン直後に必ず開き、閉じる導線を持たないため、放置すると全画面に被る。
 * 本文を末尾まで読まないと「同意する」が押せない実装なので、
 * スクロール領域を一番下まで送ってから押す。
 * @param page Playwright のページ
 */
const dismissLegalConsent = async (page: Page): Promise<void> => {
  // ログイン直後は client component のマウントが間に合わず、まだ DOM に無いことがある。
  // 「出ていない」と決めつけずに数秒待ち、それでも出なければ同意済みとみなす。
  const agree = page.getByRole("button", { name: "同意する" });
  try {
    await agree.waitFor({ state: "visible", timeout: 10000 });
  } catch {
    return;
  }
  await page
    .locator('[role="dialog"] .overflow-y-auto')
    .first()
    .evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
  await agree.click();
  await agree.waitFor({ state: "hidden", timeout: 30000 });
  await settle(page);
};

/**
 * ログイン済みのコンテキストを作る。
 *
 * storageState の復元では足りない（ログイン中のスタッフ名がヘッダーに出ない）ため、
 * 実際にログイン操作を行ったコンテキストをそのまま使い回す。
 * @param browser Playwright のブラウザ
 * @returns ログイン済みのコンテキスト
 */
const createLoggedInContext = async (
  browser: Browser,
  account: Account,
): Promise<BrowserContext> => {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
  });
  await maskCastPhotos(ctx);
  const page = await ctx.newPage();
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="storeCode"]', account.storeCode);
  await page.fill('input[name="emailAddress"]', account.userId);
  await page.fill('input[name="password"]', account.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await dismissLegalConsent(page);
  return ctx;
};

/**
 * 1 枚撮影して保存する
 * @param page Playwright のページ
 * @param shot 撮影定義
 * @returns 保存したファイルの相対パス
 */
const capture = async (page: Page, shot: Shot): Promise<string> => {
  const dir = path.join(OUTPUT_ROOT, shot.section, shot.slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(
    dir,
    `${String(shot.index).padStart(2, "0")}-${shot.name}.jpg`,
  );

  if (shot.viewportHeight) {
    await page.setViewportSize({
      width: VIEWPORT.width,
      height: shot.viewportHeight,
    });
  }
  await page.goto(`${ADMIN_URL}${shot.path}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE_DEV_CHROME });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  if (shot.prepare) await shot.prepare(page);
  // prepare で DOM が差し替わってもオーバーレイが復活しないよう再適用する
  await page.addStyleTag({ content: HIDE_DEV_CHROME });

  const options = { path: file, type: "jpeg" as const, quality: IMAGE_QUALITY };
  if (shot.selector) {
    await page.locator(shot.selector).first().screenshot(options);
  } else {
    await page.screenshot(options);
  }
  // 次のショットに高さを持ち越さない
  if (shot.viewportHeight) await page.setViewportSize(VIEWPORT);
  return path.relative(process.cwd(), file);
};

const main = async (): Promise<void> => {
  const filter = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const shots = filter.length
    ? SHOTS.filter((s) => filter.some((f) => s.slug.includes(f)))
    : SHOTS;

  if (shots.length === 0) {
    console.error(`該当する撮影対象がありません: ${filter.join(", ")}`);
    process.exit(1);
  }

  const res = await fetch(`${ADMIN_URL}/login`).catch(() => null);
  if (!res?.ok) {
    console.error(
      `管理画面に接続できません: ${ADMIN_URL}\n` +
        `pixi-admin を MSW 有効で起動してください（cd ../pixi-admin && pnpm dev -p 3002）`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    /** アカウント種別 → ログイン済みコンテキスト（初回アクセス時に作る） */
    const contexts = new Map<keyof typeof ACCOUNTS, BrowserContext>();
    const contextFor = async (
      kind: keyof typeof ACCOUNTS,
    ): Promise<BrowserContext> => {
      const cached = contexts.get(kind);
      if (cached) return cached;
      const created = await createLoggedInContext(browser, ACCOUNTS[kind]);
      contexts.set(kind, created);
      console.log(
        `✅ ログイン(${kind}): ${ACCOUNTS[kind].storeCode} / ${ACCOUNTS[kind].userId}`,
      );
      return created;
    };

    for (const shot of shots) {
      // ログイン画面はログアウト状態で撮るため、毎回まっさらなコンテキストを使う
      const guestCtx =
        shot.auth === false
          ? await browser.newContext({
              viewport: VIEWPORT,
              deviceScaleFactor: SCALE,
            })
          : null;
      if (guestCtx) await maskCastPhotos(guestCtx);
      const page = guestCtx
        ? await guestCtx.newPage()
        : (await contextFor(shot.account ?? "default")).pages()[0];

      try {
        const out = await capture(page, shot);
        console.log(`📸 ${shot.slug} #${shot.index} → ${out}`);
      } catch (err) {
        console.error(
          `❌ ${shot.slug} #${shot.index} (${shot.name}) 失敗: ${
            err instanceof Error ? err.message.split("\n")[0] : String(err)
          }`,
        );
      }
      await guestCtx?.close();
    }
    for (const ctx of contexts.values()) await ctx.close();
  } finally {
    await browser.close();
  }
};

main().catch((err) => {
  console.error("❌ 撮影に失敗しました:", err);
  process.exit(1);
});
