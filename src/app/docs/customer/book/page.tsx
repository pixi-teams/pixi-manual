import { getDocsBySections, roleSections } from "@/lib/mdx";
import { MdxContent } from "@/components/MdxContent";

export const metadata = {
  title: "お客様向けマニュアル（通し読み） | pixi",
  description: "pixiのWeb予約に関するお客様向け操作マニュアル — 全文表示",
};

export default function CustomerBookPage() {
  const docs = getDocsBySections(roleSections.customer);

  return (
    <div className="book-view">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-pixi-800 border-b-2 border-pixi-600 pb-4 inline-block">
          pixi マニュアル — お客様向け
        </h1>
        <p className="mt-3 text-gray-500 text-sm">
          Web予約に関する操作マニュアル
        </p>
      </div>

      {docs.map((doc) => (
        <article
          key={doc.slug}
          id={doc.slug}
          className="mb-16 scroll-mt-8"
        >
          <MdxContent source={doc.content} />
        </article>
      ))}
    </div>
  );
}
