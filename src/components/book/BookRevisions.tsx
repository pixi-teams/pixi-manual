import { formatVersion, manualMeta } from "@content/manual-meta";

/**
 * 1冊ビューの改訂履歴ページ。manualMeta.revisions を新しい順に表示する。
 * @returns 改訂履歴のセクション
 */
export const BookRevisions = () => (
  <section className="book-front" aria-labelledby="book-revisions-title">
    <h1 id="book-revisions-title" className="book-front-title">
      改訂履歴
    </h1>
    <div className="table-scroll">
      <table className="book-revisions">
        <thead>
        <tr>
          <th scope="col">版数</th>
          <th scope="col">発行日</th>
          <th scope="col">改訂内容</th>
        </tr>
      </thead>
      <tbody>
        {manualMeta.revisions.map((revision) => (
          <tr key={revision.version}>
            <td className="book-revisions-version">
              {formatVersion(revision.version)}
            </td>
            <td className="book-revisions-date">{revision.date}</td>
            <td>{revision.summary}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  </section>
);
