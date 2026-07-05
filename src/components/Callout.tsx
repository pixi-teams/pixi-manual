import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "step";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const presets: Record<
  CalloutType,
  { label: string; icon: string; color: string; bg: string }
> = {
  note: { label: "メモ", icon: "ℹ️", color: "#0369a1", bg: "rgba(2,132,199,0.08)" },
  tip: { label: "ヒント", icon: "💡", color: "#15803d", bg: "rgba(21,128,61,0.08)" },
  warning: {
    label: "注意",
    icon: "⚠️",
    color: "#b45309",
    bg: "rgba(180,83,9,0.09)",
  },
  step: { label: "手順", icon: "📝", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

/**
 * 注意・ヒント・手順などを強調表示する Callout。
 * Markdown(MDX) から <Callout type="warning">...</Callout> の形で利用できる。
 */
export const Callout = ({ type = "note", title, children }: CalloutProps) => {
  const preset = presets[type];
  return (
    <div
      className="my-5 rounded-md border-l-4 px-4 py-3"
      style={{ borderColor: preset.color, background: preset.bg }}
    >
      <p
        className="mb-1 flex items-center gap-2 text-sm font-semibold"
        style={{ color: preset.color }}
      >
        <span aria-hidden>{preset.icon}</span>
        {title ?? preset.label}
      </p>
      <div className="text-sm leading-relaxed text-fg [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
};
