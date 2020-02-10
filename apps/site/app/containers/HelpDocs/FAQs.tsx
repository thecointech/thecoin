import React from "react";
import { FAQ } from "./FAQ";
import { FAQDocument } from "containers/Prismic/types";
import { Item } from "semantic-ui-react";

type Props = {
  faqs: FAQDocument[]
}

export const FAQs = ({ faqs }: Props) => {
  return (
    <Item.Group divided>
      {faqs.map(faq => <FAQ key={faq.id} {...faq} />)}
    </Item.Group>
  )
}
