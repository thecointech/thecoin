import React from "react";
import styles from "./styles.module.less";
import { ElementRender } from "components/Renderer/ElementRender";
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useSelector } from "react-redux";
import _ from "lodash";
import { selectArticles } from "components/Prismic/selectors";
import { RenderableType } from "components/Prismic/types";

export const Article = ( props: { match: { params: { articleId: any; }; }; } ) => {
  const docs = (useSelector(selectArticles));
  const { articleId } = props.match.params;
  const filtered = docs.filter(entry => entry.id == articleId);


  
  return <>{
    filtered.map(articleData => (    
      <div className={styles.containerArticle}>
        { articleData.data.image_before_title.url ? <img src={ articleData.data.image_before_title.url} alt={articleData.data.image_before_title.alt}/> : "" }
        {  <ElementRender {...articleData.data.title ? articleData.data.title[0] : [] as unknown as RenderableType}/> }
        { RichText.render(articleData.data.content as unknown as RichTextBlock[]) }
      </div>
    ))
  }</>
}
