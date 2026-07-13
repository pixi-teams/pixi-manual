import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * ファビコン（ブランド調の角丸スクエア + P）。
 * ロゴのティール→ブルーのグラデーションに合わせる。
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22b6c6 0%, #3f6fd1 100%)",
          color: "#ffffff",
          fontSize: 44,
          fontWeight: 700,
          borderRadius: 14,
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
