import React from "react";
import { RenderableType } from "components/Prismic/types"
import { Header } from "semantic-ui-react";


//function applyStyles(){

//}

export const ElementRender = ({type, text, spans}: RenderableType) => {

  const style = spans ? spans : "";
  //let textToFormat;
  var res = text.slice(0, 5); 
  console.log("style---",style[0],res)

  for (const styleLine of style) {
    console.log("styleLine---",(styleLine as any))
    switch((styleLine as any).type)
    {
      case "hyperlink":
        return <a href={(styleLine as any).data.url} target={(styleLine as any).data.target}>{text}</a>;
      case "strong":
        return <strong>{text}</strong>;
      case "em":
        return <em>{text}</em>;

      default:
        return <span>{text}</span>
    }
  }


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
