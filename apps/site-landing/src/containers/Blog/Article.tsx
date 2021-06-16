import React, { useEffect } from "react";
import styles from "./styles.module.less";
import { ElementRender } from "components/Renderer/ElementRender";
import {RichText, RichTextBlock} from 'prismic-reactjs';
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import _ from "lodash";
import { usePrismicActions } from "components/Prismic/reducer";


export const Article = ( props: { match: { params: { articleId: any; }; }; } ) =>{
  const actions = usePrismicActions();
  const docs = useSelector((s: ApplicationRootState) => s.documents);
  const { articleId } = props.match.params;
  const article = _.filter(docs["articles"], { id: articleId });
  const data = article[0]["data"];
  const title = (article[0]).data.title ? (article[0]).data.title[0] : "";

  useEffect(() => {
    actions.fetchAllDocs();
    console.log((docs["articles"]),articleId)
  }, []);
  return (
    <div className={styles.containerArticle}>
      { data.image_before_title.url ? <img src={ data.image_before_title.url} alt={data.image_before_title.alt}/> : "" }
      { title ? <ElementRender {...title}/> : "" }
      { RichText.render(data.content as unknown as RichTextBlock[]) }
    </div>
  )
}
