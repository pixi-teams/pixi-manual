import Link from "next/link";

const roleLabels: Record<string, string> = {
  customer: "お客様向け",
  cast: "キャスト向け",
  admin: "管理者向け",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-pixi-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-pixi-800 font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              pixi マニュアル
            </span>
          </Link>
          <nav className="flex gap-6 text-sm">
            {Object.entries(roleLabels).map(([role, label]) => (
              <Link
                key={role}
                href={`/docs/${role}`}
                className="hover:text-pixi-200 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} pixi — マニュアル
        </div>
      </footer>
    </div>
  );
}
