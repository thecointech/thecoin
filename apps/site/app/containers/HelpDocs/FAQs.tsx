import React from "react";
import { FAQ } from "./FAQ";
import { FAQDocument } from "containers/Prismic/types";

type Props = {
  faqs: FAQDocument[]
}

export const FAQs = ({ faqs }: Props) =>
  <>
    {faqs.map(faq => <FAQ {...faq} />)}
  </>
