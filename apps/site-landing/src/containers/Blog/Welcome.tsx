import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { defineMessages, FormattedMessage } from "react-intl";
import { ArticleList } from "./ArticleList";
import { Dictionary } from "lodash";

type Props = {
  articles: ArticleDocument[],
  menu: Dictionary<ArticleDocument[]>
}

const translations = defineMessages({
  title : {
      defaultMessage: 'Blog',
      description: 'site.blog.title: Title for the In-depth blog page'}
  });

export const Welcome = (props: Props) => {
  return (
    <div>
      <Header as="h2" textAlign={"center"} className={"x10spaceBefore"}>
          <FormattedMessage {...translations.title} />
      </Header>
      <ArticleList articles={props.articles} menu={props.menu} />
    </div>
  )
}
