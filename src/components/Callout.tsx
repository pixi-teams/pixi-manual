import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "step";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

/** 種別ごとのラベル */
const labels: Record<CalloutType, string> = {
  note: "メモ",
  tip: "ヒント",
  warning: "注意",
  step: "手順",
};

/**
 * 種別ごとのアイコン（16px・stroke ベースのインライン SVG）。
 * 絵文字を使わず無彩色で描き、モノトーンの体裁を保つ。
 */
const icons: Record<CalloutType, ReactNode> = {
  note: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  tip: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.8 10.6c.5.5 1 1.2 1 2v.4h5.6v-.4c0-.8.5-1.5 1-2A6 6 0 0 0 12 3Z" />
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  step: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  ),
};

/**
 * 注意・ヒント・手順などを強調表示する Callout。
 * 色は globals.css の per-type トークン（--callout-*）を参照し、
 * ライト/ダーク両テーマでモノトーンに表示する。区別はラベルとアイコンで行う。
 * Markdown(MDX) から <Callout type="warning">...</Callout> の形で利用できる。
 */
export const Callout = ({ type = "note", title, children }: CalloutProps) => {
  return (
    <div className={`callout callout-${type}`}>
      <p className="callout-title">
        {icons[type]}
        {title ?? labels[type]}
      </p>
      <div className="callout-body">{children}</div>
    </div>
  );
};
