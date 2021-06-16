import React from "react";
import { RenderableType } from "components/Prismic/types";
import { Header } from "semantic-ui-react";

export const ElementRender = ({type, text}: RenderableType) => {

  switch(type)
  {
    case "heading1":
      return <Header as={"h1"}>{text}</Header>;
    case "heading2":
      return <Header as={"h2"}>{text}</Header>;
    case "heading3":
      return <Header as={"h3"}>{text}</Header>;
    case "heading4":
      return <Header as={"h4"}>{text}</Header>;
    case "list-item":
        return <div>• {text}</div>;

    case "paragraph":
    default:
      return <p>{text}</p>
  }
}
