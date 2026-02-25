import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DocEntry {
  slug: string;
  section: string;
  title: string;
  content: string;
  order: number;
}

/**
 * ファイルの内容からタイトルを抽出する
 * @param content ファイルの内容
 * @returns タイトル
 */
const extractTitle = (content: string): string => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

/**
 * ファイル名から順番を抽出する
 * @param filename ファイル名
 * @returns 順番
 */
const getOrderFromFilename = (filename: string): number => {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}

/**
 * セクションディレクトリからドキュメント一覧を取得する
 * @param sectionDir セクションディレクトリ
 * @returns ドキュメント一覧
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
}

/**
 * 複数のセクションディレクトリからドキュメント一覧を取得する
 * @param sectionDirs セクションディレクトリ配列
 * @returns ドキュメント一覧
 */
export const getDocsBySections = (sectionDirs: string[]): DocEntry[] => {
  return sectionDirs.flatMap((dir) => getDocsBySection(dir));
}

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
