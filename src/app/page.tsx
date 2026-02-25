import Link from "next/link";

export const metadata = {
  title: "pixi マニュアル",
  description: "pixi 操作マニュアル — ロール別入口",
};

const roles = [
  {
    id: "customer",
    title: "お客様向け",
    description: "Web予約の操作方法",
    icon: "📱",
    sections: ["Web予約"],
  },
  {
    id: "cast",
    title: "キャスト向け",
    description: "Web予約・キャスト管理の操作方法",
    icon: "👤",
    sections: ["Web予約", "キャスト管理"],
  },
  {
    id: "admin",
    title: "管理者向け",
    description: "全機能の操作方法",
    icon: "⚙️",
    sections: ["Web予約", "キャスト管理", "管理機能"],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pixi-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pixi-800 rounded-xl mb-6">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold text-pixi-900 mb-4">
            pixi マニュアル
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            ご利用のロールを選択してください
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/docs/${role.id}`}
              className="group block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-pixi-300 transition-all duration-200"
            >
              <div className="text-3xl mb-4">{role.icon}</div>
              <h2 className="text-lg font-semibold text-pixi-800 group-hover:text-pixi-600 transition-colors mb-2">
                {role.title}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              <div className="flex flex-wrap gap-2">
                {role.sections.map((section) => (
                  <span
                    key={section}
                    className="text-xs bg-pixi-50 text-pixi-700 px-2 py-1 rounded-full"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
