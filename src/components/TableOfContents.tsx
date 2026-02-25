import Link from "next/link";
import { DocEntry, sectionLabels } from "@/lib/mdx";

interface TableOfContentsProps {
  docs: DocEntry[];
  role: string;
}

export const TableOfContents = ({ docs, role }: TableOfContentsProps) => {
  const grouped = docs.reduce<Record<string, DocEntry[]>>((acc, doc) => {
    if (!acc[doc.section]) acc[doc.section] = [];
    acc[doc.section].push(doc);
    return acc;
  }, {});

  return (
    <nav className="space-y-8">
      {Object.entries(grouped).map(([section, entries]) => (
        <div key={section}>
          <h2 className="text-lg font-semibold text-pixi-700 mb-3 border-b border-pixi-200 pb-2">
            {sectionLabels[section] || section}
          </h2>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/docs/${role}/book#${entry.slug}`}
                  className="text-gray-700 hover:text-pixi-600 transition-colors flex items-center gap-2"
                >
                  <span className="text-pixi-400">›</span>
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
