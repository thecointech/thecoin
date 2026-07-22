import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { RichText } from "@/components";

/**
 * Props for `ComparisonBlock`.
 */
export type ComparisonBlockProps =
  SliceComponentProps<Content.ComparisonBlockSlice>;

/**
 * Component for "ComparisonBlock" Slices.
 */
const ComparisonBlock: FC<ComparisonBlockProps> = ({ slice }) => {
  return (
    <section
      className={styles.comparisonBlock}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.header}>
        <span>{slice.primary.titleleft}</span>
        <span>- vs -</span>
        <span>{slice.primary.titleright}</span>
      </div>
      {
        slice.primary.elements.map((item, index) => (
          <div key={index} className={styles.element}>
            <span className={styles.left}>
              <RichText field={item.leftelement} />
            </span>
            <span className={styles.right}>
              <RichText field={item.rightelement} />
            </span>
          </div>
        ))
      }
    </section>
  );
};

export default ComparisonBlock;
