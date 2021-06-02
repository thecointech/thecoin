import React from "react";
import { FAQ } from "./FAQ";
import { FAQDocument } from "components/Prismic/types";

type Props = {
  faqs: FAQDocument[]
}

export const FAQs = ({ faqs }: Props) => {
  return (
    <div className={"x10spaceBefore x8spaceAfter"}>
      {faqs.map(faq => <FAQ key={faq.id} {...faq} />)}
    </div>
  )
}
