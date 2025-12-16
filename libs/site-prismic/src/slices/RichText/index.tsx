// ./src/slices/RichText/index.tsx

import React from "react";
import type { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { RichText } from "@/components/RichText";

type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

export default function RichTextSlice({ slice }: RichTextProps) {
  return (
    <section>
      <RichText field={slice.primary.content} />
    </section>
  );
}
