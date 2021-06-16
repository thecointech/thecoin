import React from "react";
import styles from "./styles.module.less";
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useSelector } from "react-redux";
import { selectArticles } from "components/Prismic/selectors";
import { Header } from "semantic-ui-react";

export const Article = ( props: { match: { params: { articleId: string; }; }; } ) => {
  const docs = (useSelector(selectArticles));
  const { articleId } = props.match.params;
  const filtered = docs.filter(entry => entry.id == articleId);
  
  return <>{
    filtered.map(articleData => (    
      <div className={styles.containerArticle}>
        { articleData.data.image_before_title.url ? <img src={ articleData.data.image_before_title.url} alt={articleData.data.image_before_title.alt}/> : "" }
        { <Header as={"h2"}>{articleData.data.title ? articleData.data.title[0].text : ""}</Header> }
        { RichText.render(articleData.data.content as unknown as RichTextBlock[]) }
      </div>
    ))
  }</>
}
