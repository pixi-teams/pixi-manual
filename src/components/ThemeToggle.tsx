"use client";

import { useSyncExternalStore } from "react";

/**
 * html.dark クラスの変化を購読する
 * @param callback 変化時に呼ぶコールバック
 * @returns 購読解除関数
 */
const subscribe = (callback: () => void): (() => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

/** 現在ダークテーマかどうか（クライアント） */
const getSnapshot = (): boolean =>
  document.documentElement.classList.contains("dark");

/** サーバー描画時のスナップショット（ライト扱い） */
const getServerSnapshot = (): boolean => false;

/**
 * ライト/ダークテーマの切り替えボタン。
 * html.dark クラスと localStorage("theme") を同期する。
 * 初期テーマ適用は layout.tsx の inline スクリプトが担当（FOUC 回避）。
 */
export const ThemeToggle = () => {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /**
   * テーマを切り替えて DOM と localStorage に反映する
   */
  const toggle = (): void => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage 不可環境では無視 */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="テーマ切り替え"
      className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-fg"
    >
      {isDark ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};
