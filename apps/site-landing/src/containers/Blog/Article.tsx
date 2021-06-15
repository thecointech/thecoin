import React from "react";
import { ArticleDocument } from "components/Prismic/types";
import { Segment } from "semantic-ui-react";
import { ElementRender } from "components/Renderer/ElementRender";
import {RichText, RichTextBlock} from 'prismic-reactjs';

export const Article = ({ data }: ArticleDocument) =>{
  console.log("Article Data", data)
  const title = data.title ? data.title[0] : "";
  return (
    <Segment>
      <img src={ data.image_before_title.url} />
      { title ? <ElementRender {...title}/> : "" }
      { RichText.render(data.content as unknown as RichTextBlock[]) }
    </Segment>
  )
}
