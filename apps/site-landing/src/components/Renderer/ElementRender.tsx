import React from "react";
import { RenderableType } from "components/Prismic/types";
import { Header } from "semantic-ui-react";

export const ElementRender = ({type, text}: RenderableType) => {

  switch(type)
  {
    case "heading1":
    case "heading2":
      return <Header as={"h2"}>{text}</Header>;
    case "heading3":
      return <span>{text}</span>;
    case "list-item":
        return <div>• {text}</div>;

    case "paragraph":
    default:
      return <p>{text}</p>
  }
}
