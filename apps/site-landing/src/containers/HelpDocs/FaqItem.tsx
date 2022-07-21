import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { PrismicRichText } from '@prismicio/react';

export const FaqItem = ({ data }: FAQDocument) =>
  <div className={"x6spaceBefore x6spaceAfter"}>
    <PrismicRichText
      field={data.question}
      components={{
        heading1: ({children}) => <Header as={"h3"}>{children}</Header>
      }}
       />
    <PrismicRichText field={data.answer} />
  </div>
