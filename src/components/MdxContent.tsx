import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Callout } from "./Callout";
import { Figure } from "./Figure";

interface MdxContentProps {
  source: string;
}

/**
 * 表を横スクロール可能なコンテナで包む。
 * 包まずに table 自体を overflow させると、狭い画面でセルが数文字ずつに
 * 潰れて読めなくなる（table の min-width が効かないため）。
 * @param props table 要素の props
 * @returns スクロールコンテナに包まれた table
 */
const ScrollableTable = (props: ComponentPropsWithoutRef<"table">) => (
  <div className="table-scroll">
    <table {...props} />
  </div>
);

/** MDX から利用できるカスタムコンポーネント */
const components = {
  Callout,
  Figure,
  table: ScrollableTable,
};

/**
 * Markdown(MDX) 本文をレンダリングする。
 * rehype-slug で見出しに id を付与し（PageToc のアンカーと一致）、
 * Callout / Figure をカスタムコンポーネントとして利用可能にする。
 */
export const MdxContent = ({ source }: MdxContentProps) => {
  return (
    <div className="prose-manual">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
};
