import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";

export const FaqItem = ({ data }: ArticleDocument) =>
  <div className={"x6spaceBefore x6spaceAfter"}>
    <img src={ data.thumbnail!.url} />
    <Header as={"h3"}><Renderer r={data.title} /></Header>
    <Renderer r={data.content} />
  </div>