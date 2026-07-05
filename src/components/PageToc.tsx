"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/mdx";

interface PageTocProps {
  headings: TocHeading[];
}

/**
 * 右カラムの「このページの目次」。
 * スクロールに応じて現在の見出しをハイライトする（スクロールスパイ）。
 */
export const PageToc = ({ headings }: PageTocProps) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="このページの目次" className="text-sm">
      <p className="mb-3 font-semibold text-fg">このページの内容</p>
      <ul className="space-y-1.5 border-l border-line">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id} style={{ paddingLeft: h.depth === 3 ? "1rem" : 0 }}>
              <a
                href={`#${h.id}`}
                className="-ml-px block border-l-2 py-0.5 pl-3 transition-colors"
                style={{
                  borderColor: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--muted)",
                }}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
