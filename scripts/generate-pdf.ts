/**
 * PDF 生成スクリプト
 *
 * Playwright で各ロールの /book ページを印刷し、
 * public/manuals/ に PDF を出力する。
 *
 * Usage:
 *   npx tsx scripts/generate-pdf.ts
 *
 * 事前に Next.js のビルドとサーバー起動が必要:
 *   pnpm build && pnpm start
 */

import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const BASE_PATH = process.env.GITHUB_ACTIONS ? "/pixi-manual" : "";
const OUTPUT_DIR = path.join(process.cwd(), "public", "manuals");

const roles = ["customer", "cast", "admin"] as const;

const roleLabels: Record<string, string> = {
  customer: "お客様向け",
  cast: "キャスト向け",
  admin: "管理者向け",
};

/**
 * サーバーが応答するまでリトライして待機する
 */
async function waitForServer(url: string, maxRetries = 30, intervalMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(url);
      console.log(`✅ Server is ready at ${url}`);
      return;
    } catch {
      if (i === 0) {
        console.log(`⏳ Waiting for server at ${url}...`);
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  throw new Error(
    `Server at ${url} did not respond after ${(maxRetries * intervalMs) / 1000} seconds`,
  );
}

async function main() {
  // サーバーの起動を待機
  await waitForServer(BASE_URL);

  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const role of roles) {
    const url = `${BASE_URL}${BASE_PATH}/docs/${role}/book`;
    const outputPath = path.join(OUTPUT_DIR, `pixi-manual-${role}.pdf`);

    console.log(`📄 Generating PDF for ${roleLabels[role]}...`);
    console.log(`   URL: ${url}`);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "2cm",
        right: "2cm",
        bottom: "2cm",
        left: "2cm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #999; font-family: 'Noto Sans JP', 'Noto Sans CJK JP', sans-serif;">
          pixi マニュアル — ${roleLabels[role]}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #999; font-family: 'Noto Sans JP', 'Noto Sans CJK JP', sans-serif;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    await page.close();
    console.log(`   ✅ ${outputPath}`);
  }

  await browser.close();
  console.log("\n🎉 All PDFs generated successfully!");
}

main().catch((err) => {
  console.error("❌ PDF generation failed:", err);
  process.exit(1);
});
