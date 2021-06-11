import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Grid, Header } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";
import styles from "./styles.module.less";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const link = { id:"site.blog.articleLink",
                defaultMessage:"Read More",
                description:"Link to access article page in blog" };

export const ArticleItem = ({ id, data }: ArticleDocument) => {
  const url = ("/blog/article-"+id).toString()
  return (
    <div className={`${styles.articleLine} x6spaceBefore x6spaceAfter`} >
      <Grid stackable columns='equal' className={`${styles.articleLineContainer}`}>
        <Grid.Row>
          <Grid.Column>
            <img src={ data.thumbnail!.url} />
          </Grid.Column>
          <Grid.Column>
            <div className={`${styles.text}`}>
              <Header as={"h3"}><Renderer r={data.title} /></Header>
              <Renderer r={data.content} />
            </div>
            <Link to={url}><FormattedMessage {...link} /></Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
