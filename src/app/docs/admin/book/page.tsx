import { getDocsBySections, roleSections } from "@/lib/mdx";
import { MdxContent } from "@/components/MdxContent";

export const metadata = {
  title: "管理者向けマニュアル（通し読み） | pixi",
  description: "pixiの全機能に関する管理者向け操作マニュアル — 全文表示",
};

export default function AdminBookPage() {
  const docs = getDocsBySections(roleSections.admin);

  return (
    <div className="book-view">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-pixi-800 border-b-2 border-pixi-600 pb-4 inline-block">
          pixi マニュアル — 管理者向け
        </h1>
        <p className="mt-3 text-gray-500 text-sm">
          全機能の操作マニュアル
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
