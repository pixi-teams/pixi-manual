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
const OUTPUT_DIR = path.join(process.cwd(), "public", "manuals");

const roles = ["customer", "cast", "admin"] as const;

const roleLabels: Record<string, string> = {
  customer: "お客様向け",
  cast: "キャスト向け",
  admin: "管理者向け",
};

async function main() {
  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const role of roles) {
    const url = `${BASE_URL}/docs/${role}/book`;
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
        <div style="font-size: 9px; width: 100%; text-align: center; color: #999;">
          pixi マニュアル — ${roleLabels[role]}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #999;">
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
