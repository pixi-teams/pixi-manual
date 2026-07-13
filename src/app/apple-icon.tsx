import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple Touch Icon（ホーム画面追加時のアイコン）。
 * ファビコンと同じブランド調の角丸スクエア + P。
 */
export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
