"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Pagefind の検索結果 1 件 */
interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

/** Pagefind の最小型（ビルド後に生成される /pagefind/pagefind.js を動的 import） */
interface PagefindApi {
  search: (q: string) => Promise<{
    results: { data: () => Promise<PagefindDoc> }[];
  }>;
}
interface PagefindDoc {
  url: string;
  meta?: { title?: string };
  excerpt: string;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Pagefind の URL を現在のサイトに合わせて補正する。
 * Pagefind は out/ 基準の URL を返すため basePath が欠けていれば補う。
 * @param url Pagefind が返す URL
 * @returns 遷移可能な URL
 */
const resolveUrl = (url: string): string => {
  let u = url.replace(/index\.html$/, "").replace(/\.html$/, "/");
  if (BASE_PATH && !u.startsWith(BASE_PATH)) u = `${BASE_PATH}${u}`;
  return u;
};

/**
 * 検索ダイアログ。トリガーボタン + モーダル + Pagefind クライアント検索。
 * Pagefind はビルド後にのみ存在するため、開発時は import 失敗を握りつぶす。
 */
export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const pagefindRef = useRef<PagefindApi | null>(null);
  const loadFailedRef = useRef(false);

  /** Pagefind バンドルを遅延ロードする */
  const loadPagefind = useCallback(async (): Promise<PagefindApi | null> => {
    if (pagefindRef.current) return pagefindRef.current;
    if (loadFailedRef.current) return null;
    try {
      const mod = (await import(
        /* webpackIgnore: true */ `${BASE_PATH}/pagefind/pagefind.js`
      )) as unknown as PagefindApi;
      pagefindRef.current = mod;
      return mod;
    } catch {
      loadFailedRef.current = true;
      return null;
    }
  }, []);

  // ⌘K / Ctrl+K でオープン
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // クエリ変化で検索（デバウンス）
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const pf = await loadPagefind();
      if (!pf) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const search = await pf.search(q);
        const docs = await Promise.all(
          search.results.slice(0, 10).map((r) => r.data()),
        );
        setResults(
          docs.map((d) => ({
            url: resolveUrl(d.url),
            title: d.meta?.title ?? "（無題）",
            excerpt: d.excerpt,
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query, open, loadPagefind]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
        aria-label="検索"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">検索</span>
        <kbd className="ml-2 hidden rounded border border-line px-1.5 text-xs text-muted-2 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-muted"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="マニュアルを検索…"
                className="w-full bg-transparent py-3.5 text-sm text-fg outline-none placeholder:text-muted-2"
              />
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  検索中…
                </p>
              )}
              {!loading && query.trim() && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  該当する項目が見つかりませんでした
                </p>
              )}
              <ul className="flex flex-col">
                {results.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.url}
                      className="block rounded-md px-3 py-2.5 transition-colors hover:bg-accent-soft"
                      onClick={() => setOpen(false)}
                    >
                      <span className="block text-sm font-medium text-fg">
                        {r.title}
                      </span>
                      <span
                        className="mt-0.5 block text-xs text-muted [&_mark]:bg-accent-soft [&_mark]:text-accent"
                        dangerouslySetInnerHTML={{ __html: r.excerpt }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
