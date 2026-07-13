import type { ReactNode } from "react";
import { getRoleNav, roles, type TocHeading } from "@/lib/mdx";
import { TopBar } from "./TopBar";
import { SidebarNav } from "./SidebarNav";
import { PageToc } from "./PageToc";

interface AppShellProps {
  role: string;
  /** 右カラムに表示する見出し（記事ページのみ） */
  headings?: TocHeading[];
  children: ReactNode;
}

/**
 * ドキュメントの 3 カラムシェル（TopBar + 左サイドバー + 本文 + 右 PageToc）。
 * data-role でロール別アクセント色を配下に伝播させる。
 * @param role ロールキー
 * @param headings 右 ToC 用見出し（省略時は右カラム非表示）
 */
export const AppShell = ({ role, headings, children }: AppShellProps) => {
  const nav = getRoleNav(role);
  const hasToc = (headings?.length ?? 0) > 0;

  return (
    <div data-role={role} className="min-h-screen bg-background text-fg">
      <TopBar role={role} roles={roles} nav={nav} pdfHref={`/docs/${role}/book`} />

      <div className="mx-auto flex w-full max-w-[1360px] gap-8 px-4 sm:px-6 lg:gap-10 lg:px-8">
        {/* 左サイドバー（デスクトップ） */}
        <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto py-8 pr-2 lg:block">
          <SidebarNav role={role} roles={roles} nav={nav} />
        </aside>

        {/* 本文 */}
        <main className="min-w-0 flex-1 py-8 lg:py-12">
          <div className="mx-auto max-w-[46rem]">{children}</div>
        </main>

        {/* 右 PageToc（記事ページのみ） */}
        {hasToc && (
          <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-12 xl:block">
            <PageToc headings={headings ?? []} />
          </aside>
        )}
      </div>
    </div>
  );
};
