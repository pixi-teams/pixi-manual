"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RoleMeta } from "@/lib/mdx";
import type { OutlineChapter } from "@/lib/outline";

interface SidebarNavProps {
  role: string;
  roles: RoleMeta[];
  /** 章番号つきの章立て */
  outline: OutlineChapter[];
  /** モバイルドロワーで項目タップ時に閉じるためのコールバック */
  onNavigate?: () => void;
}

/**
 * 末尾スラッシュを除去してパスを正規化する（trailingSlash 対応）
 * @param p パス
 * @returns 正規化済みパス
 */
const normalize = (p: string): string =>
  p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;

/**
 * サイドバーのナビ本体。ロール切替セグメント + 章/記事ツリー。
 * 現在地は usePathname で判定してアクセント色で強調する。
 */
export const SidebarNav = ({
  role,
  roles,
  outline,
  onNavigate,
}: SidebarNavProps) => {
  const pathname = normalize(usePathname());

  return (
    <div className="flex flex-col gap-6">
      {/* ロール切替 */}
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          マニュアル
        </p>
        <div className="flex flex-col gap-0.5">
          {roles.map((r) => {
            const active = r.key === role;
            return (
              <Link
                key={r.key}
                href={`/docs/${r.key}`}
                data-role={r.key}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center rounded-md px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-surface-2 font-semibold text-fg"
                    : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 章 → 記事ツリー */}
      <nav className="flex flex-col gap-5">
        {outline.map((chapter) => (
          <div key={chapter.anchorId}>
            <p className="mb-1.5 flex gap-2 px-1 text-xs font-semibold tracking-wide text-muted-2">
              <span className="w-5 shrink-0 tabular-nums">{chapter.number}</span>
              <span>{chapter.title}</span>
            </p>
            <ul className="flex flex-col gap-0.5">
              {chapter.sections.map((section) => {
                const active = pathname === normalize(section.href);
                return (
                  <li key={section.slug}>
                    <Link
                      href={section.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-surface-2 font-medium text-fg"
                          : "text-muted hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      <span className="shrink-0 tabular-nums text-muted-2">
                        {section.number}
                      </span>
                      <span>{section.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};
