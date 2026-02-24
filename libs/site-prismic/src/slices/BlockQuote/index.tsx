import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import styles from './index.module.css';

/**
 * Props for `BlockQuote`.
 */
export type BlockQuoteProps = SliceComponentProps<Content.BlockQuoteSlice>;

/**
 * Component for "BlockQuote" Slices.
 */
const BlockQuote: FC<BlockQuoteProps> = ({ slice }) => {
  return (
    <blockquote
      className={styles.blockQuote}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {/* Quote Text - Rich Text Field */}
      <div className={styles.quoteText}>
        <PrismicRichText
          field={slice.primary.quotetext}
          components={{
            heading3: ({ children }) => (
              <h3>
                <span className={styles.quoteSymbol}>&#8220;</span>
                {children}
                <span className={styles.quoteSymbol}>&#8221;</span>
              </h3>
            ),
          }}
        />
      </div>

      {/* Attribution and Source */}
      {(isFilled.keyText(slice.primary.attribution) || isFilled.link(slice.primary.quotesource)) && (
        <footer className={styles.attribution}>
          {/* Attribution - Key Text Field */}
          {isFilled.keyText(slice.primary.attribution) && (
            <cite>
              — {slice.primary.attribution}
            </cite>
          )}

          {/* Source - Link Field (Optional) */}
          {isFilled.link(slice.primary.quotesource) && (
            <span>
              <PrismicNextLink
                field={slice.primary.quotesource}
                className={styles.source}
              >
                {slice.primary.quotesource.text || "Source"}
              </PrismicNextLink>
            </span>
          )}
        </footer>
      )}
    </blockquote>
  );
};

export default BlockQuote;
