import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoleDocs, getRoleMeta, roles } from "@/lib/mdx";
import { MdxContent } from "@/components/MdxContent";

interface PageParams {
  role: string;
}

/**
 * 全ロールの通し読み（book）ページを静的生成する。
 * このページは Playwright の PDF 生成対象（サイトクロームなし）。
 */
export const generateStaticParams = async (): Promise<PageParams[]> => {
  return roles.map((r) => ({ role: r.key }));
};

/**
 * book ページの metadata を生成する
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
    title: `${roleMeta.label}マニュアル（通し読み） | pixi`,
  };
};

export default async function BookPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { role } = await params;
  const roleMeta = getRoleMeta(role);
  if (!roleMeta) notFound();

  const docs = getRoleDocs(role);

  return (
    <div data-role={role} className="bg-background text-fg">
      <div className="book-view mx-auto max-w-3xl px-6 py-10">
        <div className="mb-12 text-center">
          <h1 className="inline-block text-3xl font-bold tracking-tight text-fg">
            pixi マニュアル — {roleMeta.label}
          </h1>
          <p className="mt-3 text-sm text-muted">{roleMeta.description}</p>
        </div>

        {docs.map((doc) => (
          <article key={`${doc.section}-${doc.slug}`} id={doc.slug} className="mb-16 scroll-mt-8">
            <MdxContent source={doc.content} />
          </article>
        ))}
      </div>
    </div>
  );
}
