import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Segment } from "semantic-ui-react";
import { ElementRender } from "components/Renderer/ElementRender";
import { ArrayRenderer } from "components/Renderer/ArrayRenderer";

export const Article = ({ data }: ArticleDocument) =>{
  console.log("Article Data", data.content)
  const title = data.title ? data.title[0] : "";
  const content = data.content ? data.content : "";
  return (
    <Segment>
      { title ? <ElementRender {...title}/> : "" }
      { content ? <ArrayRenderer renderables={...content}/> : "" }
    </Segment>
  )
}
