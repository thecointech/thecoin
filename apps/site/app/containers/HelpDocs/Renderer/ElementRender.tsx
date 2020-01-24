import React from "react";
import { RenderableType } from "containers/Prismic/types"
import { Header } from "semantic-ui-react";

export const ElementRender = ({type, text}: RenderableType) => {

  switch(type)
  {
    case "heading2":
      return <Header>{text}</Header>;
    case "heading3":
      return <Header size="small">{text}</Header>;
    case "paragraph":
      return <p>{text}</p>
    default:
      return <p>WARNING: No Renderer for element:  {type as string}</p>
  }
}