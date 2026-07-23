import React from 'react';
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
        <span className={styles.titleLeft}>{slice.primary.titleleft}</span>
        <span>- vs -</span>
        <span className={styles.titleRight}>{slice.primary.titleright}</span>
      </div>
      {
        slice.primary.elements.map((item, index) => (
          <div key={index} className={styles.element}>
            <div className={styles.left}>
              <RichText field={item.leftelement} />
            </div>
            <div className={styles.right}>
              <RichText field={item.rightelement} />
            </div>
          </div>
        ))
      }
    </section>
  );
};

export default ComparisonBlock;
