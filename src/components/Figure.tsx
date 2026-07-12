const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface FigureProps {
  /** 画像パス。public 基準（例: /manuals/customer/10-web-reservation/01-overview/01.png） */
  src?: string;
  /** 代替テキスト */
  alt: string;
  /** 画像下に表示するキャプション */
  caption?: string;
}

/**
 * スクリーンショット用のフレーム付き画像。
 * src が未指定の間は「準備中」プレースホルダを表示し、
 * 実画像が揃う前でもレイアウトを確認できるようにする。
 * Markdown(MDX) から <Figure src="..." alt="..." caption="..." /> で利用する。
 */
export const Figure = ({ src, alt, caption }: FigureProps) => {
  const resolvedSrc =
    src && src.startsWith("/") ? `${BASE_PATH}${src}` : src;
  return (
    <figure className="my-6">
      {resolvedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          className="mx-auto block h-auto max-w-full rounded-md border border-line-strong bg-surface-2 shadow-sm"
        />
      ) : (
        <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-line-strong bg-surface-2 text-sm text-muted">
          <span>📷 スクリーンショット準備中{alt ? `：${alt}` : ""}</span>
        </div>
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
