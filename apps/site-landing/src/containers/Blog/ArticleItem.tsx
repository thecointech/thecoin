import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Grid, Header } from "semantic-ui-react";
import styles from "./styles.module.less";
import { Link } from "react-router-dom";
import { defineMessages, FormattedMessage } from "react-intl";
import { RichText, RichTextBlock } from "prismic-reactjs";

const translations = defineMessages({
  link : {
      defaultMessage: 'Read More',
      description: 'site.blog.articleLink: Link to access article page in blog'}
  });

export const ArticleItem = ({ id, data }: ArticleDocument) => {
  const url = ("/blog/"+id).toString();
  return (
    <div className={`${styles.articleLine} x6spaceBefore x6spaceAfter`} >
      <Grid stackable columns='equal' className={`${styles.articleLineContainer}`}>
        <Grid.Row>
          <Grid.Column>
            <img src={ data.thumbnail.url} alt={data.thumbnail.alt} />
          </Grid.Column>
          <Grid.Column>
            <div className={`${styles.text}`}>
              <Header as={"h4"}>{data.title ? data.title[0].text : ""}</Header>
              { RichText.render(data.short_content as unknown as RichTextBlock[]) }
            </div>
            <Link to={url}><FormattedMessage {...translations.link} /></Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
