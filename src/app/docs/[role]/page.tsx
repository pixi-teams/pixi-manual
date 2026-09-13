import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleMeta, roles } from "@/lib/mdx";
import { getRoleOutline } from "@/lib/outline";
import { AppShell } from "@/components/AppShell";
import { formatIssuedAt, formatVersion, manualMeta } from "@content/manual-meta";

interface PageParams {
  role: string;
}

/**
 * 全ロールの目次ページを静的生成する
 */
export const generateStaticParams = async (): Promise<PageParams[]> => {
  return roles.map((r) => ({ role: r.key }));
};

/**
 * ロール目次ページの metadata を生成する
 */
export const generateMetadata = async ({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> => {
  const { role } = await params;
  const roleMeta = getRoleMeta(role);
  if (!roleMeta) return {};
  return {
    title: `${roleMeta.label}マニュアル | pixi`,
    description: `pixi ${roleMeta.label}の操作マニュアル`,
  };
};

export default async function RoleIndexPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { role } = await params;
  const roleMeta = getRoleMeta(role);
  if (!roleMeta) notFound();

  const outline = getRoleOutline(role);

  return (
    <AppShell role={role}>
      <div className="mb-10 border-b border-line pb-8">
        <p className="mb-2 text-sm font-medium text-muted">{roleMeta.label}</p>
        <h1 className="text-3xl font-bold tracking-tight text-fg">
          {roleMeta.label}
          {manualMeta.title}
        </h1>
        <p className="mt-3 text-muted">{roleMeta.description}</p>
        <p className="mt-4 text-xs text-muted-2">
          {formatVersion(manualMeta.version)}・
          {formatIssuedAt(manualMeta.issuedAt)}発行
        </p>
      </div>

      <h2 className="mb-6 text-lg font-semibold text-fg">目次</h2>

      <div className="flex flex-col gap-8">
        {outline.map((chapter) => (
          <section key={chapter.anchorId}>
            <h3 className="flex gap-3 border-b border-line pb-2 text-base font-semibold text-fg">
              <span className="w-8 shrink-0 tabular-nums text-muted">
                {chapter.number}
              </span>
              <span>{chapter.title}</span>
            </h3>
            <ul className="mt-1">
              {chapter.sections.map((section) => (
                <li key={section.anchorId}>
                  <Link
                    href={section.href}
                    className="group flex items-baseline gap-3 rounded-md px-1 py-2 transition-colors hover:bg-surface-2"
                  >
                    <span className="w-8 shrink-0 tabular-nums text-sm text-muted-2">
                      {section.number}
                    </span>
                    <span className="text-fg group-hover:text-accent-ink">
                      {section.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
