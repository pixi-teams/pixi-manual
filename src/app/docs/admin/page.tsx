import { getDocsBySections, roleSections } from "@/lib/mdx";
import { TableOfContents } from "@/components/TableOfContents";
import Link from "next/link";

export const metadata = {
  title: "管理者向けマニュアル | pixi",
  description: "pixiの全機能に関する管理者向け操作マニュアル",
};

export default function AdminPage() {
  const docs = getDocsBySections(roleSections.admin);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-pixi-800 border-b-2 border-pixi-600 pb-3">
          管理者向けマニュアル
        </h1>
        <p className="mt-3 text-gray-600">
          Web予約・キャスト管理・システム設定など、全機能の操作方法をご案内します。
        </p>
      </div>

      <TableOfContents docs={docs} role="admin" />

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link
          href="/docs/admin/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-pixi-600 text-white rounded-md hover:bg-pixi-700 transition-colors text-sm font-medium"
        >
          📖 通しで読む（Book View）
        </Link>
      </div>
    </div>
  );
}
