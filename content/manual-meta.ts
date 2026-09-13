/**
 * マニュアル成果物のメタ情報。
 *
 * 表紙・改訂履歴ページ・PDF のヘッダー/フッターの正本。
 * リリース（manual-vX.Y.Z タグ）の前に version / issuedAt / revisions を更新する。
 */

/** 改訂履歴の 1 行 */
export interface Revision {
  /** 版数（タグの manual-v を除いた部分と揃える） */
  version: string;
  /** 発行日（YYYY-MM-DD） */
  date: string;
  /** 改訂内容の要約 */
  summary: string;
}

/** マニュアル全体のメタ情報 */
export interface ManualMeta {
  productName: string;
  title: string;
  version: string;
  issuedAt: string;
  publisher: string;
  revisions: Revision[];
}

/**
 * 現在発行中のマニュアルのメタ情報
 */
export const manualMeta: ManualMeta = {
  productName: "pixi",
  title: "操作マニュアル",
  version: "0.4.0",
  issuedAt: "2026-08-16",
  // TODO: 発行元の正式名称に差し替える（表紙・PDF フッターに表示される）
  publisher: "pixi 運営事務局",
  revisions: [
    {
      version: "0.4.0",
      date: "2026-08-16",
      summary:
        "表紙・改訂履歴・目次・章扉を追加し、章番号を導入。PDF の体裁を全面刷新。",
    },
    {
      version: "0.3.0",
      date: "2026-07-14",
      summary: "Notion 風モノトーンのデザインシステムへ刷新。",
    },
    {
      version: "0.2.1",
      date: "2026-07-14",
      summary: "管理者・キャスト向けマニュアルを実装準拠で全面作成。",
    },
    {
      version: "0.1.2",
      date: "2026-02-25",
      summary: "初版。Web予約（お客様向け）を公開。",
    },
  ],
};

/**
 * 版数を "v" 付きで整形する
 * @param version 版数
 * @returns 例: "v0.4.0"
 */
export const formatVersion = (version: string): string => `v${version}`;

/**
 * 日付を和文表記に整形する
 * @param date YYYY-MM-DD 形式の日付
 * @returns 例: "2026年8月16日"
 */
export const formatIssuedAt = (date: string): string => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
};
