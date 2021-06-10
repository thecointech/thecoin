import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Grid, Header } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";
import styles from "./styles.module.less";

export const ArticleItem = ({ data }: ArticleDocument) =>
  <div className={`${styles.articleLine} x6spaceBefore x6spaceAfter`} >
    <Grid stackable columns='equal' class={`${styles.articleLineContainer}`}>
      <Grid.Row>
        <Grid.Column>
          <img src={ data.thumbnail!.url} />
        </Grid.Column>
        <Grid.Column>
          <div className={`${styles.text}`}>
            <Header as={"h3"}><Renderer r={data.title} /></Header>
            <Renderer r={data.content} />
          </div>
          <a>Read More</a>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>