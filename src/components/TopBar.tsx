"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavSection, RoleMeta } from "@/lib/mdx";
import { SidebarNav } from "./SidebarNav";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  role: string;
  roles: RoleMeta[];
  nav: NavSection[];
  /** PDF / 印刷用（book ビュー）への遷移先 */
  pdfHref: string;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 上部固定バー。ロゴ・検索・テーマ切替・PDF リンク、
 * および小画面でのサイドバードロワーを管理する。
 */
export const TopBar = ({ role, roles, nav, pdfHref }: TopBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ドロワー表示中は Esc で閉じ、背面スクロールを止める
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* モバイル: メニュー */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
          className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        {/* ロゴ（比率維持） */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="pixi マニュアル トップ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/logo_v3.png`}
            alt=""
            width={61}
            height={24}
            className="h-6 w-auto"
          />
          <span className="hidden font-semibold tracking-tight text-fg sm:inline">
            マニュアル
          </span>
        </Link>

        <div className="flex-1" />

        <SearchDialog />
        <ThemeToggle />
        <Link
          href={pdfHref}
          className="hidden items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface-2 sm:flex"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
            aria-hidden
          >
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
          </svg>
          PDF
        </Link>
      </div>

      {/* モバイルドロワー */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ナビゲーション"
            className="absolute left-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto border-r border-line bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold tracking-tight text-fg">
                pixi マニュアル
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="メニューを閉じる"
                className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav
              role={role}
              roles={roles}
              nav={nav}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
