import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Callout } from "./Callout";
import { Figure } from "./Figure";

interface MdxContentProps {
  source: string;
}

/** MDX から利用できるカスタムコンポーネント */
const components = {
  Callout,
  Figure,
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
