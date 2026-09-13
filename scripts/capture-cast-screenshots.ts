/**
 * キャストアプリ（pixi-cast）のスクリーンショットを撮影して public/manuals/cast/ に保存する。
 *
 * キャストアプリはスマートフォンで使うものなので、**SP サイズ（390x844）で撮る**。
 * 例外は「PC のサイドバー」を説明する 1 枚だけで、その項目にだけ viewport を上書きしている。
 *
 * 撮影対象は SHOTS に宣言的に並べる。UI が変わったら、その項目の prepare を直して
 * `pnpm shots:cast -- <slug>` で必要な分だけ撮り直す。
 *
 * ⚠ 必ず **origin/develop の最新** を撮ること。
 *    ローカルの作業ツリーは別ブランチ・古い状態のことがあり、実際とは違う画面が撮れる。
 *    作業ツリーを汚さずに最新を用意するには worktree を使う:
 *
 *      cd ../pixi-cast
 *      git fetch origin develop
 *      git worktree add ../.worktrees/manual-shots-cast --detach origin/develop
 *      cd ../.worktrees/manual-shots-cast
 *      cp ../../pixi-cast/.env.local .           # NEXT_PUBLIC_API_MOCKING=enabled
 *      git submodule update --init apollon-swagger
 *      pnpm install && pnpm api:generate
 *      pnpm dev -p 3005
 *
 * ⚠ MSW は NODE_ENV=development でしかモックしないため、撮影は必ず `pnpm dev` で行う
 *   （`pnpm build && pnpm start` ではログインが「通信エラー」になる）。
 *
 * ⚠ dev の初回コンパイルは 1 ルートあたり数十秒かかる。撮影前にログイン済みの
 *   ブラウザで対象ルートを一巡して温めておかないと、goto が既定の 30 秒で落ちる。
 *
 * 撮影:
 *      pnpm shots:cast              # 全件
 *      pnpm shots:cast -- 01-login  # slug に部分一致するものだけ
 *
 * 環境変数:
 *   CAST_URL         キャストアプリの URL（既定 http://localhost:3005）
 *   CAST_STORE_CODE / CAST_ID / CAST_PASSWORD  モックのログイン情報
 */

import path from "path";
import fs from "fs";
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

const CAST_URL = process.env.CAST_URL || "http://localhost:3005";

const STORE_CODE = process.env.CAST_STORE_CODE || "demo-store";
const CAST_ID = process.env.CAST_ID || "cst-00123";
const PASSWORD = process.env.CAST_PASSWORD || "password";

const ROLE = "cast";
const OUTPUT_ROOT = path.join(process.cwd(), "public", "manuals", ROLE);

/**
 * SP の既定ビューポート。iPhone 14 相当の 390x844 で揃える。
 * キャストアプリは下部ナビが固定表示なので fullPage では撮らない
 * （固定要素がページ途中に描かれて、実機と違う絵になる）。
 */
const VIEWPORT = { width: 390, height: 844 };
/** PC のサイドバーを説明する 1 枚だけで使う。 */
const PC_VIEWPORT = { width: 1280, height: 900 };
/** 3 倍で撮る（A4 に 80mm 幅で置いても十分な解像度になる） */
const SCALE = 3;
/**
 * JPEG で保存する。PNG だと枚数分でリポジトリが重くなりすぎる。
 * 印刷は 3 倍解像度から縮小されるため、この品質なら劣化は見えない。
 */
const IMAGE_QUALITY = 88;
/**
 * ページ遷移の待ち時間。dev サーバーはルートごとの初回コンパイルに数十秒かかり、
 * Playwright 既定の 30 秒では足りない（温めても混み合うと超える）。
 */
const NAV_TIMEOUT = 180000;

/**
 * モックのプロフィール写真は外部配布物に載せない。
 * ネットワーク段で無地のアバターに差し替える（CSS より確実で、どの画面でも効く）。
 */
const PLACEHOLDER_AVATAR = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f3dbe4"/>
  <circle cx="100" cy="78" r="34" fill="#d9a8bd"/>
  <path d="M100 122c-38 0-64 24-64 54v24h128v-24c0-30-26-54-64-54z" fill="#d9a8bd"/>
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
  /** キャストアプリのパス */
  path: string;
  /** ログイン不要なら false（既定 true） */
  auth?: boolean;
  /** この要素だけを撮る（省略時はビューポート全体） */
  selector?: string;
  /** PC 幅で撮る（サイドバーの説明など、SP では写らないものだけ） */
  desktop?: boolean;
  /** 撮影前の操作 */
  prepare?: (page: Page) => Promise<void>;
}

/** 描画が落ち着くまで待つ。アニメーション・遅延ロードを取りこぼさないため。 */
const settle = async (page: Page, ms = 900): Promise<void> => {
  await page.waitForTimeout(ms);
};

/**
 * スクロールするのは window ではなく <main>。
 * キャストアプリはヘッダーと下部ナビを固定するため、本文だけが独立して
 * スクロールする作りになっている。window.scrollTo では 1px も動かない。
 */
const SCROLLER = "main";

/** ページ先頭へ戻す（前のショットのスクロール位置を持ち越さない） */
const toTop = async (page: Page): Promise<void> => {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollTo({ top: 0 });
  }, SCROLLER);
  await page.waitForTimeout(300);
};

/** スクロール領域を絶対位置まで送る */
const scrollBy = async (page: Page, top: number): Promise<void> => {
  await page.evaluate(
    ([sel, y]) => {
      document.querySelector(sel as string)?.scrollTo({ top: y as number });
    },
    [SCROLLER, top] as const,
  );
  await page.waitForTimeout(600);
};

/**
 * 指定要素が画面の上のほうに来るまでスクロールする。
 *
 * 同じ文字列が非表示の要素にも含まれることがあるため、**実際に描画されている
 * （boundingBox が取れる）最初の要素**を選ぶ。last() で拾うと画面外の重複要素を
 * 掴んでしまい、スクロール位置が 0 のまま動かない。
 *
 * scrollIntoViewIfNeeded は「すでに見えている」と判断すると動かないので使わない。
 * 画面の下端にギリギリ写っている状態では、説明用の絵として使えないため。
 */
const scrollTo = async (page: Page, selector: string): Promise<void> => {
  let handle = null;
  for (const candidate of await page.locator(selector).all()) {
    if (await candidate.boundingBox().catch(() => null)) {
      handle = await candidate.elementHandle().catch(() => null);
      if (handle) break;
    }
  }
  if (!handle) return;
  await page.evaluate(
    ([el, sel]) => {
      const scroller = document.querySelector(sel as string);
      const node = el as HTMLElement | null;
      if (!scroller || !node) return;
      const top =
        node.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      scroller.scrollTo({ top: Math.max(0, top - 72) });
    },
    [handle, SCROLLER] as const,
  );
  await page.waitForTimeout(600);
};

/** スクロール領域を最後まで送る */
const scrollToBottom = async (page: Page): Promise<void> => {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, SCROLLER);
  await page.waitForTimeout(600);
};

/**
 * 顧客一覧の先頭の顧客を開く。
 * 詳細の ID はモックデータ次第で変わるため、URL を直打ちせず一覧から辿る。
 * @param page Playwright のページ
 */
const openFirstCustomer = async (page: Page): Promise<void> => {
  await page.locator('a[href^="/customers/"]').first().click();
  await page.waitForURL(/\/customers\/.+/, { timeout: NAV_TIMEOUT });
  await settle(page, 1500);
};

export const SHOTS: Shot[] = [
  // ---------------- 20-cast-basics ----------------
  {
    section: "20-cast-basics",
    slug: "01-login",
    index: 1,
    name: "login-form",
    path: "/",
    auth: false,
    prepare: async (page) => {
      await page.fill('input[name="storeCode"]', STORE_CODE);
      await page.fill('input[name="castId"]', CAST_ID);
      await page.fill('input[name="password"]', PASSWORD);
      await settle(page);
    },
  },
  {
    section: "20-cast-basics",
    slug: "01-login",
    index: 2,
    name: "social-login",
    path: "/",
    auth: false,
    prepare: async (page) => {
      await page.fill('input[name="storeCode"]', STORE_CODE);
      await scrollTo(page, 'button:has-text("Google")');
      await settle(page);
    },
  },
  {
    section: "20-cast-basics",
    slug: "02-navigation",
    index: 1,
    name: "bottom-nav",
    path: "/dashboard",
  },
  {
    section: "20-cast-basics",
    slug: "02-navigation",
    index: 2,
    name: "pc-sidebar",
    path: "/dashboard",
    desktop: true,
  },
  {
    section: "20-cast-basics",
    slug: "02-navigation",
    index: 3,
    name: "profile-menu",
    path: "/dashboard",
    prepare: async (page) => {
      // ヘッダーの名前つきアバター（押すとマイページ／ログアウトが出る）
      await page.locator("header button").nth(1).click();
      await settle(page);
    },
  },
  {
    section: "20-cast-basics",
    slug: "02-navigation",
    index: 4,
    name: "notification-bell",
    path: "/dashboard",
    prepare: async (page) => {
      await page.locator("header button").last().click();
      await settle(page);
    },
  },
  {
    section: "20-cast-basics",
    slug: "03-dashboard",
    index: 1,
    name: "date-header",
    path: "/dashboard",
  },
  {
    section: "20-cast-basics",
    slug: "03-dashboard",
    index: 2,
    name: "sales-summary",
    path: "/dashboard",
    prepare: async (page) => {
      await scrollTo(page, 'a[href="/reports"]');
    },
  },
  {
    section: "20-cast-basics",
    slug: "03-dashboard",
    index: 3,
    name: "today-list",
    path: "/dashboard",
    prepare: async (page) => {
      await scrollTo(page, 'a[href^="/reservations/rsv"]');
    },
  },
  {
    section: "20-cast-basics",
    slug: "04-notifications-pwa",
    index: 1,
    name: "notification-list",
    path: "/dashboard",
    prepare: async (page) => {
      await page.locator("header button").last().click();
      await settle(page);
    },
  },
  {
    section: "20-cast-basics",
    slug: "04-notifications-pwa",
    index: 2,
    name: "push-toggle",
    path: "/dashboard",
    prepare: async (page) => {
      await page.locator("header button").last().click();
      await settle(page);
      await scrollTo(page, 'text=/プッシュ通知/');
    },
  },

  // ---------------- 30-cast-schedule-shift ----------------
  {
    section: "30-cast-schedule-shift",
    slug: "01-schedule",
    index: 1,
    name: "schedule",
    path: "/schedules",
  },
  {
    section: "30-cast-schedule-shift",
    slug: "01-schedule",
    index: 2,
    name: "view-switch",
    path: "/schedules",
  },
  {
    section: "30-cast-schedule-shift",
    slug: "01-schedule",
    index: 3,
    name: "event-popover",
    path: "/schedules",
    prepare: async (page) => {
      await page.locator('[class*="event"], [data-event-id]').first().click();
      await settle(page);
    },
  },
  {
    section: "30-cast-schedule-shift",
    slug: "01-schedule",
    index: 4,
    name: "create-button",
    path: "/schedules",
    prepare: async (page) => {
      await scrollTo(page, 'a[href="/reservations/create"]');
    },
  },
  {
    section: "30-cast-schedule-shift",
    slug: "02-shifts",
    index: 1,
    name: "shifts",
    path: "/shifts",
  },
  {
    section: "30-cast-schedule-shift",
    slug: "02-shifts",
    index: 2,
    name: "apply-form",
    path: "/shifts",
    prepare: async (page) => {
      await page.getByRole("button", { name: /シフト申請/ }).first().click();
      await settle(page);
    },
  },
  {
    section: "30-cast-schedule-shift",
    slug: "02-shifts",
    index: 3,
    name: "shift-detail",
    path: "/shifts",
    prepare: async (page) => {
      // 申請履歴の 1 件目を開く（申請中のものだけ取り消せる）
      await scrollTo(page, "text=/シフト申請履歴/");
      await page
        .locator("text=/シフト申請履歴/")
        .locator("xpath=../following-sibling::*[1]//*[self::button or self::li or self::div][1]")
        .first()
        .click()
        .catch(() => {});
      await settle(page, 1500);
    },
  },
  {
    section: "30-cast-schedule-shift",
    slug: "02-shifts",
    index: 4,
    name: "open-shift",
    path: "/shifts",
    prepare: async (page) => {
      await scrollTo(page, "text=/空きシフト/");
    },
  },
  {
    section: "30-cast-schedule-shift",
    slug: "02-shifts",
    index: 5,
    name: "history-sort",
    path: "/shifts",
    prepare: async (page) => {
      await scrollTo(page, "text=/シフト申請履歴/");
    },
  },

  // ---------------- 40-cast-reservations ----------------
  {
    section: "40-cast-reservations",
    slug: "01-reservation-list",
    index: 1,
    name: "today-cards",
    path: "/reservations",
  },
  {
    section: "40-cast-reservations",
    slug: "01-reservation-list",
    index: 2,
    name: "filter-modal",
    path: "/reservations",
    prepare: async (page) => {
      // 検索欄の右にある絞り込みボタン
      await page.locator('input[type="text"], input[type="search"]').first().waitFor();
      await page
        .locator("button")
        .filter({ has: page.locator("svg") })
        .nth(2)
        .click();
      await settle(page);
    },
  },
  {
    section: "40-cast-reservations",
    slug: "01-reservation-list",
    index: 3,
    name: "reservation-rows",
    path: "/reservations",
    prepare: async (page) => {
      await scrollTo(page, 'a[href^="/reservations/rsv"]');
    },
  },
  {
    section: "40-cast-reservations",
    slug: "02-reservation-create",
    index: 1,
    name: "step1-customer",
    path: "/reservations/create",
  },
  {
    section: "40-cast-reservations",
    slug: "02-reservation-create",
    index: 2,
    name: "step2-service",
    path: "/reservations/create",
    prepare: async (page) => {
      await scrollTo(page, "text=/施術内容/");
    },
  },
  {
    section: "40-cast-reservations",
    slug: "02-reservation-create",
    index: 3,
    name: "step3-payment",
    path: "/reservations/create",
    prepare: async (page) => {
      await scrollTo(page, "text=/お支払い/");
    },
  },
  {
    section: "40-cast-reservations",
    slug: "02-reservation-create",
    index: 4,
    name: "step4-confirm",
    path: "/reservations/create",
    prepare: async (page) => {
      await scrollToBottom(page);
    },
  },
  {
    section: "40-cast-reservations",
    slug: "03-reservation-detail",
    index: 1,
    name: "detail-customer",
    path: "/reservations/rsv_001",
  },
  {
    section: "40-cast-reservations",
    slug: "03-reservation-detail",
    index: 2,
    name: "detail-service",
    path: "/reservations/rsv_001",
    prepare: async (page) => {
      await scrollTo(page, "text=/予約内容/");
    },
  },
  {
    section: "40-cast-reservations",
    slug: "03-reservation-detail",
    index: 3,
    name: "detail-payment",
    path: "/reservations/rsv_001",
    prepare: async (page) => {
      await scrollTo(page, "text=/支払い/");
    },
  },
  {
    section: "40-cast-reservations",
    slug: "03-reservation-detail",
    index: 4,
    name: "detail-bottom",
    path: "/reservations/rsv_001",
    prepare: async (page) => {
      await scrollToBottom(page);
    },
  },

  // ---------------- 50-cast-customers ----------------
  {
    section: "50-cast-customers",
    slug: "01-customer-list",
    index: 1,
    name: "customer-search",
    path: "/customers",
  },
  {
    section: "50-cast-customers",
    slug: "01-customer-list",
    index: 2,
    name: "customer-filter",
    path: "/customers",
    prepare: async (page) => {
      await scrollTo(page, "text=/最近/");
    },
  },
  {
    section: "50-cast-customers",
    slug: "01-customer-list",
    index: 3,
    name: "customer-cards",
    path: "/customers",
    prepare: async (page) => {
      await scrollTo(page, 'a[href^="/customers/"]');
    },
  },
  {
    section: "50-cast-customers",
    slug: "02-customer-detail",
    index: 1,
    name: "detail-profile",
    path: "/customers",
    prepare: openFirstCustomer,
  },
  {
    section: "50-cast-customers",
    slug: "02-customer-detail",
    index: 2,
    name: "detail-basic",
    path: "/customers",
    prepare: async (page) => {
      await openFirstCustomer(page);
      await scrollTo(page, "text=/基本情報/");
    },
  },
  {
    section: "50-cast-customers",
    slug: "02-customer-detail",
    index: 3,
    name: "detail-memo",
    path: "/customers",
    prepare: async (page) => {
      await openFirstCustomer(page);
      await scrollTo(page, "text=/メモ/");
    },
  },
  {
    section: "50-cast-customers",
    slug: "02-customer-detail",
    index: 4,
    name: "detail-history",
    path: "/customers",
    prepare: async (page) => {
      await openFirstCustomer(page);
      await scrollTo(page, "text=/来店/");
    },
  },
  {
    section: "50-cast-customers",
    slug: "02-customer-detail",
    index: 5,
    name: "create-fab",
    path: "/customers",
    prepare: async (page) => {
      await openFirstCustomer(page);
      // 右下の「＋」（新規予約）は固定表示なので、末尾まで送って一緒に写す
      await scrollToBottom(page);
    },
  },

  // ---------------- 60-cast-report-mypage ----------------
  {
    section: "60-cast-report-mypage",
    slug: "01-reports",
    index: 1,
    name: "period-tabs",
    path: "/reports",
  },
  {
    section: "60-cast-report-mypage",
    slug: "01-reports",
    index: 2,
    name: "summary-cards",
    path: "/reports",
    prepare: async (page) => {
      await scrollBy(page, 320);
    },
  },
  {
    section: "60-cast-report-mypage",
    slug: "01-reports",
    index: 3,
    name: "sales-chart",
    path: "/reports",
    prepare: async (page) => {
      await scrollBy(page, 980);
    },
  },
  {
    section: "60-cast-report-mypage",
    slug: "01-reports",
    index: 4,
    name: "breakdown",
    path: "/reports",
    prepare: async (page) => {
      await scrollBy(page, 2100);
    },
  },
  {
    section: "60-cast-report-mypage",
    slug: "02-mypage",
    index: 1,
    name: "profile-tab",
    path: "/mypage",
  },
  {
    section: "60-cast-report-mypage",
    slug: "02-mypage",
    index: 2,
    name: "course-tab",
    path: "/mypage",
    prepare: async (page) => {
      await page.getByRole("button", { name: /コース/ }).first().click();
      await settle(page);
    },
  },
  {
    section: "60-cast-report-mypage",
    slug: "02-mypage",
    index: 3,
    name: "login-tab",
    path: "/mypage",
    prepare: async (page) => {
      await page.getByRole("button", { name: /ログイン情報/ }).first().click();
      await settle(page);
    },
  },
];

/**
 * モックのプロフィール写真を無地アバターに差し替える。
 * Next.js の画像最適化を経由すると URL が /_next/image?url=%2Ftest2.png に
 * なるため、パス一致ではなく URL 全体の部分一致で判定する。
 * @param ctx ブラウザコンテキスト
 */
const maskCastPhotos = async (ctx: BrowserContext): Promise<void> => {
  await ctx.route(
    (url) => url.href.includes("test1") || url.href.includes("test2"),
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
 *
 * 同意は Server Action で Cookie を消して反映されるが、直後の 1 回だけ
 * 反映前のページが描かれることがあるため、呼び出し側は各ショットでも呼ぶ。
 * @param page Playwright のページ
 */
const dismissLegalConsent = async (page: Page): Promise<void> => {
  const agree = page.getByRole("button", { name: "同意する" });
  if (!(await agree.isVisible().catch(() => false))) return;
  await page
    .locator('[role="dialog"] .overflow-y-auto')
    .first()
    .evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    })
    .catch(() => {});
  await agree.click();
  await agree.waitFor({ state: "hidden", timeout: 30000 });
  await settle(page);
};

/**
 * ログイン済みのコンテキストを作る。
 *
 * storageState の復元では足りない（ヘッダーの表示名が出ない）ため、
 * 実際にログイン操作を行ったコンテキストをそのまま使い回す。
 * @param browser Playwright のブラウザ
 * @returns ログイン済みのコンテキスト
 */
const createLoggedInContext = async (
  browser: Browser,
): Promise<BrowserContext> => {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: true,
  });
  await maskCastPhotos(ctx);
  const page = await ctx.newPage();
  // dev サーバーは初回コンパイルに数十秒かかる。既定の 30 秒では足りない。
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);
  page.setDefaultTimeout(60000);
  await page.goto(`${CAST_URL}/`, { waitUntil: "networkidle" });
  await page.fill('input[name="storeCode"]', STORE_CODE);
  await page.fill('input[name="castId"]', CAST_ID);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  await settle(page, 1500);
  await dismissLegalConsent(page);
  // 同意の反映（Cookie 削除）を確実に拾わせるため一度読み直す
  await page.reload({ waitUntil: "networkidle" });
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

  if (shot.desktop) await page.setViewportSize(PC_VIEWPORT);

  await page.goto(`${CAST_URL}${shot.path}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE_DEV_CHROME });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  await dismissLegalConsent(page);
  await toTop(page);
  if (shot.prepare) await shot.prepare(page);
  // prepare で DOM が差し替わってもオーバーレイが復活しないよう再適用する
  await page.addStyleTag({ content: HIDE_DEV_CHROME });

  const options = { path: file, type: "jpeg" as const, quality: IMAGE_QUALITY };
  if (shot.selector) {
    await page.locator(shot.selector).first().screenshot(options);
  } else {
    await page.screenshot(options);
  }
  // 次のショットに PC 幅を持ち越さない
  if (shot.desktop) await page.setViewportSize(VIEWPORT);
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

  const res = await fetch(`${CAST_URL}/`).catch(() => null);
  if (!res?.ok) {
    console.error(
      `キャストアプリに接続できません: ${CAST_URL}\n` +
        `worktree で \`pnpm dev -p 3005\` を起動してから実行してください。`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  let anonCtx: BrowserContext | null = null;
  let authCtx: BrowserContext | null = null;
  let failed = 0;

  try {
    for (const shot of shots) {
      const needsAuth = shot.auth !== false;
      let page: Page;
      if (needsAuth) {
        if (!authCtx) {
          authCtx = await createLoggedInContext(browser);
          console.log(`✅ ログイン: ${STORE_CODE} / ${CAST_ID}`);
        }
        page = authCtx.pages()[0] ?? (await authCtx.newPage());
      } else {
        if (!anonCtx) {
          anonCtx = await browser.newContext({
            viewport: VIEWPORT,
            deviceScaleFactor: SCALE,
            isMobile: true,
            hasTouch: true,
          });
          await maskCastPhotos(anonCtx);
        }
        page = anonCtx.pages()[0] ?? (await anonCtx.newPage());
        page.setDefaultNavigationTimeout(NAV_TIMEOUT);
        page.setDefaultTimeout(60000);
      }

      try {
        const saved = await capture(page, shot);
        console.log(`📸 ${shot.slug} #${shot.index} → ${saved}`);
      } catch (err) {
        failed += 1;
        console.error(
          `❌ ${shot.slug} #${shot.index} (${shot.name}) 失敗: ${
            err instanceof Error ? err.message.split("\n")[0] : String(err)
          }`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  if (failed > 0) {
    console.error(`\n${failed} 件の撮影に失敗しました。`);
    process.exit(1);
  }
};

main();
