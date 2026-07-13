import Link from "next/link";

/** パンくずの 1 項目 */
export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/**
 * 記事上部のパンくずリスト。
 * 最終項目はリンクにせず現在地として表示する。
 */
export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="パンくず" className="mb-6 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-accent-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-fg" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-2"
                  aria-hidden
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
