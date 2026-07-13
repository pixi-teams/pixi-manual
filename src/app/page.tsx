import type { Metadata } from "next";
import Link from "next/link";
import { roles, roleSections, sectionLabels } from "@/lib/mdx";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "pixi マニュアル",
  description: "pixi 操作マニュアル — ロール別入口",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}/logo_v3.png`}
              alt=""
              width={61}
              height={24}
              className="h-6 w-auto"
            />
            <span className="font-semibold tracking-tight">マニュアル</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:pt-24">
        {/* Hero */}
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-muted">pixi ドキュメント</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            pixi 操作マニュアル
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            ご利用の立場にあわせて、操作マニュアルをご覧いただけます。
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => {
            const sections = (roleSections[role.key] ?? []).map(
              (s) => sectionLabels[s] ?? s,
            );
            return (
              <Link
                key={role.key}
                href={`/docs/${role.key}`}
                data-role={role.key}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface p-6 transition-colors hover:border-line-strong hover:bg-surface-2"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" />
                <span className="mb-4 inline-grid size-10 place-items-center rounded-lg bg-accent-soft text-lg font-bold text-accent-ink">
                  {role.label.charAt(0)}
                </span>
                <h2 className="text-lg font-semibold">{role.label}</h2>
                <p className="mt-1 text-sm text-muted">{role.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sections.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent-ink">
                  マニュアルを開く
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted">
          &copy; {new Date().getFullYear()} pixi — マニュアル
        </div>
      </footer>
    </div>
  );
}
