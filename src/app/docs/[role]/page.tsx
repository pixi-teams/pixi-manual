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
        <p className="mb-2 text-sm font-semibold text-accent">
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
            <h2 className="mb-4 flex items-center gap-2.5 text-lg font-semibold text-fg">
              <span
                className="inline-block h-5 w-1 rounded"
                style={{ background: "var(--accent)" }}
              />
              {section.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <span className="block font-medium text-fg group-hover:text-accent">
                    {item.title}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted group-hover:text-accent">
                    開く →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
