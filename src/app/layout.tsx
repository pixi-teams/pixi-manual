import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

/**
 * 欧文・数字は Inter。和文は OS 標準の高品質ゴシック
 * （Hiragino / Yu Gothic / Noto）にフォールバックさせる。
 * 和文 Web フォントは容量が大きく SSG に不向きなため読み込まない。
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixi-teams.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "pixi マニュアル",
    template: "%s | pixi マニュアル",
  },
  description: "pixi 操作マニュアル — Web予約・キャスト管理・システム管理",
  openGraph: {
    title: "pixi マニュアル",
    description: "pixi 操作マニュアル — Web予約・キャスト管理・システム管理",
    siteName: "pixi マニュアル",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "pixi マニュアル",
    description: "pixi 操作マニュアル — Web予約・キャスト管理・システム管理",
  },
};

/**
 * 初期テーマ適用スクリプト（FOUC 回避）。
 * localStorage("theme") または OS 設定を見て html.dark を先付けする。
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
