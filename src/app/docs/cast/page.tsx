import { getDocsBySections, roleSections } from "@/lib/mdx";
import { TableOfContents } from "@/components/TableOfContents";
import Link from "next/link";

export const metadata = {
  title: "キャスト向けマニュアル | pixi",
  description: "pixiのWeb予約・キャスト管理に関するキャスト向け操作マニュアル",
};

export default function CastPage() {
  const docs = getDocsBySections(roleSections.cast);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-pixi-800 border-b-2 border-pixi-600 pb-3">
          キャスト向けマニュアル
        </h1>
        <p className="mt-3 text-gray-600">
          Web予約およびキャスト管理に関する操作方法をご案内します。
        </p>
      </div>

      <TableOfContents docs={docs} role="cast" />

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link
          href="/docs/cast/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-pixi-600 text-white rounded-md hover:bg-pixi-700 transition-colors text-sm font-medium"
        >
          📖 通しで読む（Book View）
        </Link>
      </div>
    </div>
  );
}
