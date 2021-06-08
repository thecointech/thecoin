import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { FormattedMessage } from "react-intl";
import { FaqList } from "./FaqList";
import { Dictionary } from "lodash";


type Props = {
  faqs: ArticleDocument[],
  menu: Dictionary<ArticleDocument[]>
}

const title = { id:"site.blog.title",
                defaultMessage:"In-depth",
                description:"Title for the In-depth blog page"};

export const Welcome = (props: Props) => {
  return (
    <div>
      <Header as="h2" className={"x10spaceBefore"}>
        <Header.Content>
          <FormattedMessage {...title} />
        </Header.Content>
      </Header>
      <FaqList faqs={props.faqs} menu={props.menu} />
    </div>
  )
}
