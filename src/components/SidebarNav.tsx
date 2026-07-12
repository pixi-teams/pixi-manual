"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection, RoleMeta } from "@/lib/mdx";

interface SidebarNavProps {
  role: string;
  roles: RoleMeta[];
  nav: NavSection[];
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
  nav,
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
        <div className="flex flex-col gap-1">
          {roles.map((r) => {
            const active = r.key === role;
            return (
              <Link
                key={r.key}
                href={`/docs/${r.key}`}
                data-role={r.key}
                onClick={onNavigate}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors"
                style={
                  active
                    ? {
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        fontWeight: 600,
                      }
                    : undefined
                }
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 章 → 記事ツリー */}
      <nav className="flex flex-col gap-5">
        {nav.map((sectionNav) => (
          <div key={sectionNav.section}>
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
              {sectionNav.label}
            </p>
            <ul className="flex flex-col gap-0.5 border-l border-line">
              {sectionNav.items.map((item) => {
                const active = pathname === normalize(item.href);
                return (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors hover:text-accent"
                      style={{
                        borderColor: active ? "var(--accent)" : "transparent",
                        color: active ? "var(--accent)" : "var(--muted)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {item.title}
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
