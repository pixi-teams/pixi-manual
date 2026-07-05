"use client";

import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
        {/* モバイル: メニュー */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="メニューを開く"
          className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-3 hover:text-fg lg:hidden"
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

        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/logo_v3.png`}
            alt="pixi"
            width={26}
            height={26}
            className="rounded"
          />
          <span className="font-semibold tracking-tight text-fg">
            pixi マニュアル
          </span>
        </Link>

        <div className="flex-1" />

        <SearchDialog />
        <ThemeToggle />
        <Link
          href={pdfHref}
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 sm:flex"
          style={{ background: "var(--accent)" }}
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
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto border-r border-line bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
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
