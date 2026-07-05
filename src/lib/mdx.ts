import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export interface DocEntry {
  slug: string;
  section: string;
  title: string;
  content: string;
  order: number;
}

/** ロール定義（表示ラベル・説明・順序） */
export interface RoleMeta {
  key: string;
  label: string;
  description: string;
}

/** 前後ページ送りの参照先 */
export interface DocLink {
  role: string;
  section: string;
  slug: string;
  title: string;
}

/** PageToc 用の見出し（H2/H3） */
export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** サイドバーのナビ項目 */
export interface NavItem {
  slug: string;
  title: string;
  href: string;
}

/** サイドバーのセクション（章）ごとのナビ */
export interface NavSection {
  section: string;
  label: string;
  items: NavItem[];
}

/**
 * ファイルの内容から H1 タイトルを抽出する
 * @param content ファイルの内容
 * @returns タイトル
 */
const extractTitle = (content: string): string => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
};

/**
 * ファイル名から表示順（連番）を抽出する
 * @param filename ファイル名
 * @returns 順番
 */
const getOrderFromFilename = (filename: string): number => {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
};

/**
 * セクションディレクトリからドキュメント一覧を取得する
 * @param sectionDir セクションディレクトリ
 * @returns ドキュメント一覧（連番昇順）
 */
export const getDocsBySection = (sectionDir: string): DocEntry[] => {
  const contentDir = path.join(process.cwd(), "content/docs");
  const sectionPath = path.join(contentDir, sectionDir);

  if (!fs.existsSync(sectionPath)) {
    return [];
  }

  const files = fs.readdirSync(sectionPath).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const filePath = path.join(sectionPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { content } = matter(raw);
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        section: sectionDir,
        title: extractTitle(content),
        content,
        order: getOrderFromFilename(file),
      };
    })
    .sort((a, b) => a.order - b.order);
};

/**
 * 複数のセクションディレクトリからドキュメント一覧を取得する
 * @param sectionDirs セクションディレクトリ配列
 * @returns ドキュメント一覧
 */
export const getDocsBySections = (sectionDirs: string[]): DocEntry[] => {
  return sectionDirs.flatMap((dir) => getDocsBySection(dir));
};

/**
 * ロール別に対応するセクションディレクトリ
 */
export const roleSections: Record<string, string[]> = {
  customer: ["10-web-reservation"],
  cast: ["10-web-reservation", "20-cast-management"],
  admin: ["10-web-reservation", "20-cast-management", "30-admin"],
};

/**
 * セクション名の表示ラベル
 */
export const sectionLabels: Record<string, string> = {
  "10-web-reservation": "Web予約",
  "20-cast-management": "キャスト管理",
  "30-admin": "管理機能",
};

/**
 * ロールのメタ情報（表示順にソート済み）
 */
export const roles: RoleMeta[] = [
  {
    key: "customer",
    label: "お客様向け",
    description: "Web予約の操作方法",
  },
  {
    key: "cast",
    label: "キャスト向け",
    description: "Web予約・キャスト管理の操作方法",
  },
  {
    key: "admin",
    label: "管理者向け",
    description: "全機能の操作方法",
  },
];

/**
 * ロールキーからメタ情報を取得する
 * @param role ロールキー
 * @returns ロールメタ（存在しなければ undefined）
 */
export const getRoleMeta = (role: string): RoleMeta | undefined => {
  return roles.find((r) => r.key === role);
};

/**
 * ロールが閲覧できる全ドキュメント（セクション順・連番順）を取得する
 * @param role ロールキー
 * @returns ドキュメント一覧
 */
export const getRoleDocs = (role: string): DocEntry[] => {
  const sections = roleSections[role];
  if (!sections) return [];
  return getDocsBySections(sections);
};

/**
 * ロール内の単一ドキュメントを取得する
 * @param role ロールキー
 * @param section セクションディレクトリ
 * @param slug ドキュメントスラッグ
 * @returns ドキュメント（存在しなければ undefined）
 */
export const getDoc = (
  role: string,
  section: string,
  slug: string,
): DocEntry | undefined => {
  return getRoleDocs(role).find(
    (doc) => doc.section === section && doc.slug === slug,
  );
};

/**
 * ロール内での前後ドキュメントを取得する
 * @param role ロールキー
 * @param section 現在のセクション
 * @param slug 現在のスラッグ
 * @returns { prev, next }（端は null）
 */
export const getAdjacentDocs = (
  role: string,
  section: string,
  slug: string,
): { prev: DocLink | null; next: DocLink | null } => {
  const docs = getRoleDocs(role);
  const index = docs.findIndex(
    (doc) => doc.section === section && doc.slug === slug,
  );

  const toLink = (doc: DocEntry | undefined): DocLink | null =>
    doc
      ? { role, section: doc.section, slug: doc.slug, title: doc.title }
      : null;

  if (index === -1) return { prev: null, next: null };
  return {
    prev: toLink(docs[index - 1]),
    next: toLink(docs[index + 1]),
  };
};

/**
 * ロールのサイドバーナビ（セクション → 記事）を構築する
 * @param role ロールキー
 * @returns セクションごとのナビ配列
 */
export const getRoleNav = (role: string): NavSection[] => {
  const sections = roleSections[role] ?? [];
  return sections
    .map((section) => ({
      section,
      label: sectionLabels[section] ?? section,
      items: getDocsBySection(section).map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        href: `/docs/${role}/${section}/${doc.slug}`,
      })),
    }))
    .filter((s) => s.items.length > 0);
};

/**
 * 全ロール分の (role, section, slug) 組み合わせを列挙する
 * generateStaticParams で使用する
 * @returns パラメータ配列
 */
export const getAllDocParams = (): {
  role: string;
  section: string;
  slug: string;
}[] => {
  return roles.flatMap((role) =>
    getRoleDocs(role.key).map((doc) => ({
      role: role.key,
      section: doc.section,
      slug: doc.slug,
    })),
  );
};

/**
 * Markdown 本文から H2/H3 見出しを抽出する（コードフェンス内は除外）。
 * id は rehype-slug と同じ github-slugger を使うため描画側のアンカーと一致する。
 * @param content Markdown 本文
 * @returns 見出し配列
 */
export const extractHeadings = (content: string): TocHeading[] => {
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];
  let inFence = false;

  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const depth = match[1].length;
    const rawText = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    // H1 はページタイトルなので slug は消費するが ToC には含めない
    const id = slugger.slug(rawText);
    if (depth === 2 || depth === 3) {
      headings.push({ id, text: rawText, depth });
    }
  }

  return headings;
};
