import React from "react";
import styles from "./styles.module.less";
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useSelector } from "react-redux";
import { selectArticles } from "components/Prismic/selectors";
import { Header, Icon } from "semantic-ui-react";
import { selectLocale } from "@thecointech/shared/containers/LanguageProvider/selector";
import { AlternateLang, ArticleDocument } from "components/Prismic/types";
import { useHistory } from "react-router-dom";
import { defineMessages, FormattedMessage } from "react-intl";

const translations = defineMessages({
  backLink : {
    defaultMessage: 'Go back',
    description: 'site.blog.backLink: Link to go back from article'}
});

function getTranslatedArticle(filtered:ArticleDocument[],docs:ArticleDocument[]) : (ArticleDocument[]){
  // -- Look for translated version --
  const { locale } = useSelector(selectLocale);
  let translation = filtered;
  for (let i = 0; i < filtered.length; i++) {
    const altLang = filtered[i].alternate_languages;
    for (let i = 0; i < altLang.length; i++){
      const altLangLine = (altLang[i] as unknown as AlternateLang);
      if (((altLangLine.lang)?.split("-"))[0] === locale){
        translation = (docs.filter(entry => entry.id == altLangLine.id))
      }
    }
  }
  return translation;
}

export const Article = ( props: { match: { params: { articleId: string; }; }; } ) => {
  const docs = (useSelector(selectArticles));
  const { articleId } = props.match.params;
  const filtered = getTranslatedArticle(docs.filter(entry => entry.id == articleId),docs)
  let history = useHistory();

  return <>{
    filtered.map(articleData => (    
      <div className={styles.containerArticle} key={articleData.id}>
        <div className={` ${styles.backLink} x6spaceBefore`}><a onClick={() => history.goBack()}><Icon name="arrow left"/><FormattedMessage {...translations.backLink} /></a></div>
        { articleData.data.image_before_title.url ? <img src={ articleData.data.image_before_title.url} alt={articleData.data.image_before_title.alt}/> : "" }
        { <Header as={"h2"} className="x6spaceBefore">{articleData.data.title ? articleData.data.title[0].text : ""}</Header> }
        { RichText.render(articleData.data.content as unknown as RichTextBlock[]) }
      </div>
    ))
  }</>
}
