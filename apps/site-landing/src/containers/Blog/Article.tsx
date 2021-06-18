import React from "react";
import styles from "./styles.module.less";
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useSelector } from "react-redux";
import { selectArticles } from "components/Prismic/selectors";
import { Header } from "semantic-ui-react";
import { selectLocale } from "@thecointech/shared/containers/LanguageProvider/selector";
import { AlternateLang } from "components/Prismic/types";
//import { DEFAULT_LOCALE } from "@thecointech/shared/containers/LanguageProvider";

export const Article = ( props: { match: { params: { articleId: string; }; }; } ) => {
  const docs = (useSelector(selectArticles));
  const { articleId } = props.match.params;
  const filtered = docs.filter(entry => entry.id == articleId);
  const { locale } = useSelector(selectLocale);
  
  // -- Look for translated version --
  filtered.map(articleData => { 
    const alternativeLangs = articleData.alternate_languages;
    alternativeLangs.map(articleLang => { 
      const altLang = (articleLang as unknown as AlternateLang);
      if (((altLang.lang)?.split("-"))[0] === locale){
        console.log("TRANSLATED==",altLang.id,docs.filter(entry => entry.id == altLang.id))
      }
    })
    //const filteredTranslation = articleData.alternate_languages.filter(entry => entry.lang == locale+"-ca");
    //console.log("translation",articleData.alternate_languages.filter(entry => entry.lang == articleId))
  })

  return <>{
    filtered.map(articleData => (    
      <div className={styles.containerArticle} key={articleData.id}>
        { articleData.data.image_before_title.url ? <img src={ articleData.data.image_before_title.url} alt={articleData.data.image_before_title.alt}/> : "" }
        { <Header as={"h2"} className="x6spaceBefore">{articleData.data.title ? articleData.data.title[0].text : ""}</Header> }
        { RichText.render(articleData.data.content as unknown as RichTextBlock[]) }
      </div>
    ))
  }</>
}
