import { formatIssuedAt, formatVersion, manualMeta } from "@content/manual-meta";
import type { RoleMeta } from "@/lib/mdx";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface BookCoverProps {
  /** 対象ロールのメタ情報 */
  roleMeta: RoleMeta;
}

/**
 * 1冊ビューの表紙。印刷時は 1 ページを占有する。
 * @param roleMeta 対象ロールのメタ情報
 * @returns 表紙のセクション
 */
export const BookCover = ({ roleMeta }: BookCoverProps) => (
  <section className="book-cover">
    <div className="book-cover-head">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE_PATH}/logo_v3.png`}
        alt={manualMeta.productName}
        className="book-cover-logo"
      />
    </div>

    <div className="book-cover-main">
      <p className="book-cover-eyebrow">{manualMeta.productName}</p>
      <h1 className="book-cover-title">{manualMeta.title}</h1>
      <p className="book-cover-role">{roleMeta.label}</p>
      <p className="book-cover-desc">{roleMeta.description}</p>
    </div>

    <dl className="book-cover-meta">
      <div>
        <dt>版数</dt>
        <dd>{formatVersion(manualMeta.version)}</dd>
      </div>
      <div>
        <dt>発行日</dt>
        <dd>{formatIssuedAt(manualMeta.issuedAt)}</dd>
      </div>
      <div>
        <dt>発行元</dt>
        <dd>{manualMeta.publisher}</dd>
      </div>
    </dl>
  </section>
);
