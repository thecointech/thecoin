import React from "react";
import { Grid, Header } from "semantic-ui-react";
import { Link } from "@thecointech/shared";
import { defineMessages, FormattedMessage } from "react-intl";
import { PrismicText } from "@prismicio/react";
import styles from "./styles.module.less";
import type { ArticleDocument } from "@thecointech/site-prismic/types";
import { useNavigate } from "react-router";
import { RichText } from "@thecointech/site-prismic/components";

const translations = defineMessages({
  link : {
      defaultMessage: 'Read More',
      description: 'site.blog.articleLink: Link to access article page in blog'}
  });

export const ArticleItem = ({ uid, data }: ArticleDocument) => {
  const url = `/blog/${uid}`;
  const navigate = useNavigate();
  return (
    <div
      className={`${styles.articleLine}`}
      role="link"
      onClick={() => navigate(url)}
      tabIndex={0}
      onKeyUp={(e) => e.key === 'Enter' && navigate(url)}
    >
      <Grid stackable columns='equal' className={`${styles.articleLineContainer}`}>
        <Grid.Row>
          <Grid.Column>
            {
              data.thumbnail?.url
                ? <img src={ data.thumbnail.url } alt={data.thumbnail.alt ?? ""} />
                : undefined
            }
          </Grid.Column>
          <Grid.Column>
            <div className={`${styles.text}`}>
              <Header as={"h4"}>
                <PrismicText field={data.title} />
              </Header>
              <RichText field={data.short_content || data.content} />
            </div>
            <div className={styles.link}><FormattedMessage {...translations.link} /></div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
