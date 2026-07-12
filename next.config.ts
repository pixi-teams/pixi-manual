import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? "/pixi-manual" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // クライアント（検索ダイアログ・画像パス補正）で basePath を参照する
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
