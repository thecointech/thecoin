import React from "react";
import { RenderableType } from "containers/Prismic/types"

export const ElementRender = ({type, text}: RenderableType) => {

  switch(type)
  {
    case "heading1":
      return <span>{text}</span>;
    case "heading2":
      return <span>{text}</span>;
    case "heading3":
      return <span>{text}</span>;
    case "list-item":
        return <div>• {text}</div>;
      
    case "paragraph":
      return <p>{text}</p>
    default:
      return <p>{text}</p>
      //return <p>WARNING: No Renderer for element:  {type as string}</p>
  }
}