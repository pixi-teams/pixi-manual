import Link from "next/link";
import type { DocLink } from "@/lib/mdx";

interface PrevNextProps {
  prev: DocLink | null;
  next: DocLink | null;
}

/**
 * 記事下部の前後ページ送り。
 * @param prev 前の記事（無ければ null）
 * @param next 次の記事（無ければ null）
 */
export const PrevNext = ({ prev, next }: PrevNextProps) => {
  if (!prev && !next) return null;

  return (
    <nav className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.role}/${prev.section}/${prev.slug}`}
          className="group rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent hover:bg-accent-soft"
        >
          <span className="block text-xs text-muted">← 前のページ</span>
          <span className="mt-0.5 block font-medium text-fg group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/docs/${next.role}/${next.section}/${next.slug}`}
          className="group rounded-md border border-line bg-surface px-4 py-3 text-right transition-colors hover:border-accent hover:bg-accent-soft"
        >
          <span className="block text-xs text-muted">次のページ →</span>
          <span className="mt-0.5 block font-medium text-fg group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
