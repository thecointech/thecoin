import React from "react";
import { RenderableType } from "containers/Prismic/types"

export const ElementRender = ({type, text}: RenderableType) => {

  switch(type)
  {
    case "heading1":
    case "heading2":
    case "heading3":
      return <span>{text}</span>;
    case "list-item":
        return <div>• {text}</div>;

    case "paragraph":
    default:
      return <p>{text}</p>
  }
}
