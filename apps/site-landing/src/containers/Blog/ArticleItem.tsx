import React from "react";
import { Grid, Header } from "semantic-ui-react";
import { Link } from "@thecointech/shared";
import { defineMessages, FormattedMessage } from "react-intl";
import { PrismicRichText, PrismicText } from "@prismicio/react";
import styles from "./styles.module.less";
import type { ArticleDocument } from "@thecointech/site-prismic/types";

const translations = defineMessages({
  link : {
      defaultMessage: 'Read More',
      description: 'site.blog.articleLink: Link to access article page in blog'}
  });

export const ArticleItem = ({ uid, data }: ArticleDocument) => {
  const url = `/blog/${uid}`;
  return (
    <div className={`${styles.articleLine} x6spaceBefore x6spaceAfter`} >
      <Grid stackable columns='equal' className={`${styles.articleLineContainer}`}>
        <Grid.Row>
          <Grid.Column>
            {
              data.thumbnail
                ? <img src={ data.thumbnail.url!} alt={data.thumbnail.alt ?? ""} />
                : undefined
            }
          </Grid.Column>
          <Grid.Column>
            <div className={`${styles.text}`}>
              <Header as={"h4"}>
                <PrismicText field={data.title} />
              </Header>
              <PrismicRichText field={data.content} />
            </div>
            <Link to={url}><FormattedMessage {...translations.link} /></Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
