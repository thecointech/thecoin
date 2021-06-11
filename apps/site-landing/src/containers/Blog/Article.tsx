import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Segment } from "semantic-ui-react";

export const Article = ({ data }: ArticleDocument) =>{
  console.log("Article Data", data)
  return (
    <Segment>
      <h1>Article</h1>
    </Segment>
  )
}
