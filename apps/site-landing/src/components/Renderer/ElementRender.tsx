import React from "react";
import { RenderableType } from "components/Prismic/types"
import { Header } from "semantic-ui-react";


function applyStyles(text: string, styles: any){
  switch(styles.type)
  {
    case "hyperlink":
      return [<a href={styles.data.url} target={styles.data.target}>{text}</a>];
    case "strong":
      return [<strong>{text}</strong>];
    case "em":
      return [<em>{text}</em>];

    default:
      return [<span>{text}</span>];
  }
}

export const ElementRender = ({type, text, spans}: RenderableType) => {

  const style = spans ? spans : "";
  let texToStyle: any[] = [];
  let index = 0;
  const textWithoutStyle = (index == 0) ? text : texToStyle[texToStyle.length] ;
  for (const styleLine of style) {
    console.log("style---", styleLine,index)
    const line = (styleLine as any)
    
    if (line.start > 0){
      texToStyle.push(textWithoutStyle.substring(0, line.start));
      console.log("line.start > 0",textWithoutStyle.substring(line.end,textWithoutStyle.length))
    }
    texToStyle.push(applyStyles(textWithoutStyle.substring(line.start, line.end),line));
    if (text.length > line.end ){
      texToStyle.push(textWithoutStyle.substring(line.end,textWithoutStyle.length));
      console.log("text.length > line.end ",textWithoutStyle.substring(line.end,textWithoutStyle.length))
    } 
    index++;
    
  }
//console.log("texToStyle3---", texToStyle,style.length)

  switch(type)
  {
    case "heading1":
    case "heading2":
      return <Header as={"h2"}>{(style.length == 0) ? text : texToStyle.map((element) => (element))}</Header>;
    case "heading3":
      return <span>{(style.length == 0)  ? text : texToStyle.map((element) => (element))}</span>;
    case "list-item":
        return <div>• {(style.length == 0) ? text : texToStyle.map((element) => (element))}</div>;

    case "paragraph":
    default:
      return <p key={}>{(style.length == 0) ? text : texToStyle.map((element) => (element))}</p>
  }
}
