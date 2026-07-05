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
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/logo_v3.png`}
            alt="pixi"
            width={26}
            height={26}
            className="rounded"
          />
          <span className="font-semibold tracking-tight">pixi マニュアル</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-20">
        {/* Hero */}
        <div className="mb-14 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            pixi マニュアル
          </h1>
          <p className="mt-4 text-lg text-muted">
            ご利用の立場にあわせて、操作マニュアルをご覧いただけます。
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((role) => {
            const sections = (roleSections[role.key] ?? []).map(
              (s) => sectionLabels[s] ?? s,
            );
            return (
              <Link
                key={role.key}
                href={`/docs/${role.key}`}
                data-role={role.key}
                className="group flex flex-col rounded-xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderTopWidth: 3, borderTopColor: "var(--accent)" }}
              >
                <span
                  className="mb-4 inline-grid size-10 place-items-center rounded-lg text-lg font-bold"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {role.label.charAt(0)}
                </span>
                <h2 className="text-lg font-semibold group-hover:text-accent">
                  {role.label}
                </h2>
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
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  マニュアルを開く →
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
