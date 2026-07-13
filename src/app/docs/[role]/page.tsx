import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleMeta, getRoleNav, roles } from "@/lib/mdx";
import { AppShell } from "@/components/AppShell";

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

  const nav = getRoleNav(role);

  return (
    <AppShell role={role}>
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium text-muted">
          {roleMeta.label}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-fg">
          {roleMeta.label}マニュアル
        </h1>
        <p className="mt-3 text-muted">{roleMeta.description}</p>
      </div>

      <div className="flex flex-col gap-10">
        {nav.map((section) => (
          <section key={section.section}>
            <h2 className="mb-4 text-lg font-semibold text-fg">
              {section.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="font-medium text-fg">{item.title}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-ink"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
