import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "pixi マニュアル";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** ビルド時にロゴを読み込み data URI 化する（Satori は fs を直接読めないため） */
const logoDataUri = (): string => {
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logo_v3.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
};

/**
 * OGP / Twitter カード画像（1200×630）。
 * ニュートラル地に実ロゴ + タグラインを配置したミニマルなカード。
 */
export default function OpengraphImage() {
  const logo = logoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 上部: ブランドバー */}
        <div
          style={{
            width: 72,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(90deg, #22b6c6 0%, #3f6fd1 100%)",
          }}
        />

        {/* 中央: ロゴ + タグライン */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} height={132} alt="" style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: "#0f172a" }}>
              Operation Manual
            </div>
            <div style={{ fontSize: 28, color: "#525c6e" }}>
              Customer · Cast · Admin
            </div>
          </div>
        </div>

        {/* 下部: 区切り + ドメイン風ラベル */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#8a94a6",
          }}
        >
          <div style={{ width: 40, height: 2, background: "#cfd5df" }} />
          pixi documentation
        </div>
      </div>
    ),
    { ...size },
  );
}
