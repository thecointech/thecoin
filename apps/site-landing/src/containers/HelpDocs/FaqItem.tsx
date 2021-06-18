import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { RichText, RichTextBlock } from "prismic-reactjs";

export const FaqItem = ({ data }: FAQDocument) =>
  <div className={"x6spaceBefore x6spaceAfter"}>
    <Header as={"h3"}>{data.question ? data.question[0].text : ""}</Header>
    {RichText.render(data.answer as unknown as RichTextBlock[])}
  </div>