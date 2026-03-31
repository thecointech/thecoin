import React, { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicImage, SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { RichText } from "@/components";

/**
 * Props for `CaptionedImage`.
 */
export type CaptionedImageProps =
  SliceComponentProps<Content.CaptionedImageSlice>;

/**
 * Component for "CaptionedImage" Slices.
 */
const CaptionedImage: FC<CaptionedImageProps> = ({ slice }) => {
  const hasCaption = slice.primary.caption && slice.primary.caption.length > 0;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={styles.captionedContainer}
    >
      <PrismicImage field={slice.primary.image} />
      {hasCaption && (
        <div className={styles.caption}>
          <RichText field={slice.primary.caption} />
        </div>
      )}
    </section>
  );
};

export default CaptionedImage;
