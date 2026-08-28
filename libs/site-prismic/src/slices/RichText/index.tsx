// ./src/slices/RichText/index.tsx

import React from "react";
import type { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { RichText } from "@/components/RichText";
import styles from "./index.module.css";

type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

const sectionClassMap = (appearance: Content.RichTextSlice['primary']['appearance']) => {
  switch (appearance) {
    case 'greyBackground':
      return styles.greyBackground;
    case 'highlightedSection':
      return styles.highlightedSection;
    default:
      return styles.default;
  }
};
export default function RichTextSlice({ slice }: RichTextProps) {
  const sectionClass = sectionClassMap(slice.primary.appearance);
  return (
    <section className={sectionClass}>
      <RichText field={slice.primary.content} />
    </section>
  );
}
