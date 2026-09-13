import { getRoleNav } from "./mdx";

/**
 * 章番号（1 / 2.1 …）の単一情報源。
 *
 * 採番規則:
 *   章  = セクションディレクトリ（roleSections の並び順）→ 1, 2, 3 …
 *   節  = そのセクション内の記事（ファイル名の連番順）      → 1.1, 1.2 …
 *
 * roleSections に章を足せば自動で採番される。番号をどこかに直書きしないこと。
 */

/** 節（＝記事 1 本） */
export interface OutlineSection {
  /** 章内での節番号（例: "3.1"） */
  number: string;
  /** 記事タイトル */
  title: string;
  /** Web 側のリンク先 */
  href: string;
  /** 1冊ビュー内のアンカー id（例: "sec-3-1"） */
  anchorId: string;
  /** セクションディレクトリ名 */
  section: string;
  /** 記事スラッグ */
  slug: string;
}

/** 章（＝セクションディレクトリ 1 つ） */
export interface OutlineChapter {
  /** 章番号（例: "3"） */
  number: string;
  /** 章タイトル（sectionLabels の値） */
  title: string;
  /** 1冊ビュー内のアンカー id（例: "ch-3"） */
  anchorId: string;
  /** セクションディレクトリ名 */
  section: string;
  /** 配下の節 */
  sections: OutlineSection[];
}

/**
 * ロールの章立て（章番号つき）を構築する
 * @param role ロールキー
 * @returns 章の配列（章番号昇順）
 */
export const getRoleOutline = (role: string): OutlineChapter[] => {
  return getRoleNav(role).map((navSection, chapterIndex) => {
    const chapterNumber = String(chapterIndex + 1);
    return {
      number: chapterNumber,
      title: navSection.label,
      anchorId: `ch-${chapterNumber}`,
      section: navSection.section,
      sections: navSection.items.map((item, sectionIndex) => {
        const sectionNumber = `${chapterNumber}.${sectionIndex + 1}`;
        return {
          number: sectionNumber,
          title: item.title,
          href: item.href,
          anchorId: `sec-${sectionNumber.replace(".", "-")}`,
          section: navSection.section,
          slug: item.slug,
        };
      }),
    };
  });
};

/**
 * 記事の節番号（例: "3.1"）を取得する
 * @param role ロールキー
 * @param section セクションディレクトリ
 * @param slug 記事スラッグ
 * @returns 節番号（見つからなければ undefined）
 */
export const getDocNumber = (
  role: string,
  section: string,
  slug: string,
): string | undefined => {
  for (const chapter of getRoleOutline(role)) {
    if (chapter.section !== section) continue;
    const found = chapter.sections.find((s) => s.slug === slug);
    if (found) return found.number;
  }
  return undefined;
};

/**
 * セクションディレクトリの章番号（例: "3"）を取得する
 * @param role ロールキー
 * @param section セクションディレクトリ
 * @returns 章番号（見つからなければ undefined）
 */
export const getChapterNumber = (
  role: string,
  section: string,
): string | undefined => {
  return getRoleOutline(role).find((c) => c.section === section)?.number;
};
