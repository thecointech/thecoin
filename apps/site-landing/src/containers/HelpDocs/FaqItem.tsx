import React from "react";
import { Header } from "semantic-ui-react";
import { PrismicRichText } from '@prismicio/react';
import type { FaqDocument } from "@thecointech/site-prismic/types";

// TODO: Move into site-prismic
export const FaqItem = ({ data }: FaqDocument) =>
  <div className={"x6spaceBefore x6spaceAfter"}>
    <PrismicRichText
      field={data.question}
      components={{
        heading1: ({children}) => <Header as={"h3"}>{children}</Header>
      }}
       />
    <PrismicRichText field={data.answer} />
  </div>
