import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoc, getRoleMeta, roles, stripTitle } from "@/lib/mdx";
import { getRoleOutline } from "@/lib/outline";
import { MdxContent } from "@/components/MdxContent";
import { BookCover } from "@/components/book/BookCover";
import { BookRevisions } from "@/components/book/BookRevisions";
import { BookToc } from "@/components/book/BookToc";
import { manualMeta } from "@content/manual-meta";

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
    title: `${roleMeta.label}${manualMeta.title}（通し読み） | ${manualMeta.productName}`,
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

  const outline = getRoleOutline(role);

  return (
    <div data-role={role} className="book bg-background text-fg">
      <BookCover roleMeta={roleMeta} />
      <BookRevisions />
      <BookToc outline={outline} />

      {outline.map((chapter) => (
        <section key={chapter.anchorId} className="book-chapter">
          {/* 章扉 */}
          <div className="book-chapter-opener">
            <h1 id={chapter.anchorId} className="book-chapter-title">
              <span className="book-chapter-num">第{chapter.number}章</span>
              <span className="book-chapter-name">{chapter.title}</span>
            </h1>
            <ol className="book-chapter-contents">
              {chapter.sections.map((section) => (
                <li key={section.anchorId}>
                  <span className="book-chapter-contents-num">
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </li>
              ))}
            </ol>
          </div>

          {chapter.sections.map((section) => {
            const doc = getDoc(role, section.section, section.slug);
            if (!doc) return null;
            return (
              <article
                key={section.anchorId}
                id={section.anchorId}
                className="book-article"
              >
                <h2 className="book-article-title">
                  <span className="book-article-num">{section.number}</span>
                  <span>{section.title}</span>
                </h2>
                <MdxContent source={stripTitle(doc.content)} />
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
