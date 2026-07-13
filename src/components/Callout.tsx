import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "step";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const presets: Record<CalloutType, { label: string; icon: string }> = {
  note: { label: "メモ", icon: "ℹ️" },
  tip: { label: "ヒント", icon: "💡" },
  warning: { label: "注意", icon: "⚠️" },
  step: { label: "手順", icon: "📝" },
};

/**
 * 注意・ヒント・手順などを強調表示する Callout。
 * 色は globals.css の per-type トークン（--callout-*）を参照し、
 * ライト/ダーク両テーマで視認できる。
 * Markdown(MDX) から <Callout type="warning">...</Callout> の形で利用できる。
 */
export const Callout = ({ type = "note", title, children }: CalloutProps) => {
  const preset = presets[type];
  return (
    <div className={`callout callout-${type}`}>
      <p className="callout-title">
        <span aria-hidden>{preset.icon}</span>
        {title ?? preset.label}
      </p>
      <div className="callout-body">{children}</div>
    </div>
  );
};
