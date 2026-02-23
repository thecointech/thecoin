import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { PrismicRichText } from "@prismicio/react";

/**
 * Props for `TwoColumnLayout`.
 */
export type TwoColumnLayoutProps =
  SliceComponentProps<Content.TwoColumnLayoutSlice>;

/**
 * Component for "TwoColumnLayout" Slices.
 */
const TwoColumnLayout: FC<TwoColumnLayoutProps> = ({ slice }) => {
  const layout = slice.primary.layout || "50-50";

  const getColumnClasses = () => {
    switch (layout) {
      case "33-66":
        return [styles.column33, styles.column66];
      case "66-33":
        return [styles.column66, styles.column33];
      default: // "50-50"
        return [styles.column50, styles.column50];
    }
  };

  const [leftColumnClass, rightColumnClass] = getColumnClasses();

  return (
    <div className={styles["two-column-layout"]}>
      <div className={`${styles.column} ${leftColumnClass}`}>
        {
          slice.primary.left_column_content?.map((item, index) => {
            return <PrismicRichText key={index} field={item.column_text} />
          })
        }
      </div>
      <div className={`${styles.column} ${rightColumnClass}`}>
        {
          slice.primary.right_column_content?.map((item, index) => {
            return <PrismicRichText key={index} field={item.column_text} />
          })
        }
      </div>
    </div>
  );
};

export default TwoColumnLayout;
