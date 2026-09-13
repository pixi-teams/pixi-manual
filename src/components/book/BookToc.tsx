import type { OutlineChapter } from "@/lib/outline";

interface BookTocProps {
  /** 章番号つきの章立て */
  outline: OutlineChapter[];
}

/**
 * 目次の 1 行。番号 → タイトル → リーダードット → ページ番号の並び。
 *
 * ページ番号は空のまま出力し、PDF 生成スクリプトが 2 パス目に
 * data-toc-page をキーとして実ページ番号を注入する。
 * 桁数が増えても行幅が変わらないよう .toc-page は固定幅にしてある。
 * data-toc-match には、参照先の見出しが本文でどう描画されるかをそのまま持たせる。
 * PDF から抽出したテキストとの照合キーになるので、見出しの描画を変えたら
 * ここも合わせて変える必要がある。
 * @param level chapter（章）か section（節）か
 * @param number 章番号・節番号
 * @param title 見出しテキスト
 * @param anchorId 参照先のアンカー id
 * @param matchText 本文側の見出しと同じ文字列（ページ番号解決の照合キー）
 * @returns 目次の行
 */
const TocRow = ({
  level,
  number,
  title,
  anchorId,
  matchText,
}: {
  level: "chapter" | "section";
  number: string;
  title: string;
  anchorId: string;
  matchText: string;
}) => (
  <li className={`toc-row toc-row-${level}`}>
    <a className="toc-link" href={`#${anchorId}`}>
      <span className="toc-num">{number}</span>
      <span className="toc-title">{title}</span>
      <span className="toc-dots" aria-hidden="true" />
      <span
        className="toc-page"
        data-toc-page={anchorId}
        data-toc-match={matchText}
      />
    </a>
  </li>
);

/**
 * 1冊ビューの目次ページ。章 → 節の 2 階層。
 * @param outline 章番号つきの章立て
 * @returns 目次のセクション
 */
export const BookToc = ({ outline }: BookTocProps) => (
  <section className="book-front" aria-labelledby="book-toc-title">
    <h1 id="book-toc-title" className="book-front-title">
      目次
    </h1>
    <ul className="toc">
      {outline.map((chapter) => (
        <li key={chapter.anchorId} className="toc-group">
          <ul className="toc-sublist">
            <TocRow
              level="chapter"
              number={chapter.number}
              title={chapter.title}
              anchorId={chapter.anchorId}
              matchText={`第${chapter.number}章${chapter.title}`}
            />
            {chapter.sections.map((section) => (
              <TocRow
                key={section.anchorId}
                level="section"
                number={section.number}
                title={section.title}
                anchorId={section.anchorId}
                matchText={`${section.number} ${section.title}`}
              />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </section>
);
