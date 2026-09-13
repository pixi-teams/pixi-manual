import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllDocParams,
  getDoc,
  getAdjacentDocs,
  getRoleMeta,
  extractHeadings,
  sectionLabels,
  stripTitle,
} from "@/lib/mdx";
import { getChapterNumber, getDocNumber } from "@/lib/outline";
import { AppShell } from "@/components/AppShell";
import { MdxContent } from "@/components/MdxContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PrevNext } from "@/components/PrevNext";

interface PageParams {
  role: string;
  section: string;
  slug: string;
}

/**
 * 全記事の (role, section, slug) を静的生成する
 */
export const generateStaticParams = async (): Promise<PageParams[]> => {
  return getAllDocParams();
};

/**
 * 記事ごとの metadata を生成する
 */
export const generateMetadata = async ({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> => {
  const { role, section, slug } = await params;
  const doc = getDoc(role, section, slug);
  const roleMeta = getRoleMeta(role);
  if (!doc || !roleMeta) return {};
  return {
    title: `${doc.title} | ${roleMeta.label} | pixi マニュアル`,
  };
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { role, section, slug } = await params;
  const doc = getDoc(role, section, slug);
  const roleMeta = getRoleMeta(role);
  if (!doc || !roleMeta) notFound();

  const headings = extractHeadings(doc.content);
  const { prev, next } = getAdjacentDocs(role, section, slug);
  const chapterNumber = getChapterNumber(role, section);
  const docNumber = getDocNumber(role, section, slug);
  const sectionLabel = sectionLabels[section] ?? section;

  return (
    <AppShell role={role} headings={headings}>
      <Breadcrumbs
        items={[
          { label: roleMeta.label, href: `/docs/${role}` },
          {
            label: chapterNumber
              ? `${chapterNumber} ${sectionLabel}`
              : sectionLabel,
          },
          { label: docNumber ? `${docNumber} ${doc.title}` : doc.title },
        ]}
      />
      <div data-pagefind-body>
        <h1 className="doc-title">
          {docNumber && <span className="doc-title-num">{docNumber}</span>}
          <span>{doc.title}</span>
        </h1>
        <MdxContent source={stripTitle(doc.content)} />
      </div>
      <PrevNext prev={prev} next={next} />
    </AppShell>
  );
}
