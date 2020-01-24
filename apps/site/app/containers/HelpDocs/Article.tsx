import React from "react";
import { ArticleDocument } from "containers/Prismic/types";
import { Segment } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";


export const Article = ({ data }: ArticleDocument) =>
  <Segment>
    <Renderer {...data} />
  </Segment>
