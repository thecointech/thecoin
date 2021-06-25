import React, { useEffect } from "react";
import { usePrismicActions } from "components/Prismic/reducer";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { ArticleList } from "./ArticleList";
import { RUrl } from "@thecointech/utilities/RUrl";
import { Dictionary } from "lodash";
import { ArticleDocument, PrismicState } from "components/Prismic/types";
import { Welcome } from "./Welcome";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import { DEFAULT_LOCALE } from '@thecointech/shared/containers/LanguageProvider/types';
import { Article } from "./Article";

const BlogInternal = (props: RouteComponentProps) => {
  const actions = usePrismicActions();
  const docs = useSelector((s: ApplicationRootState) => s.documents);
  const { match } = props;
  const buildUrl = (id: string) => {
    let sub = id.replace(/ /g, '-')
                .replace('&', 'n')
                .toLocaleLowerCase();
    return new RUrl(match.url, encodeURIComponent(sub));
  }

  useEffect(() => {
    actions.fetchAllDocs();
  }, []);

  const categories = buildCategories(docs);
  return (
    <>
      <Switch>
        {
          Object.entries(categories).map((entry, index) => {
              const url = buildUrl("theme-"+((entry[0])?.split("-"))[0].replace(/ /g,'')).toString()
              return <Route key={index} exact={true} path={url} render={() => <ArticleList menu={categories} title={entry[0]} articles={entry[1]} />} />
            })
        }
        <Route path="/blog/:articleId" render={(articleProps) => <Article {...articleProps} />} />
        <Route path={("").toString()} exact={true} render={()=> <Welcome articles={docs.articles} menu={categories} />} />
      </Switch>
    </>
  );
}

// https://github.com/react-boilerplate/redux-injectors/issues/16
export const Blog = (props: RouteComponentProps) => {
  return <BlogInternal {...props} /> // The rest of the code
}

export function buildCategories(docs: PrismicState) {
  const { articles } = docs;
  const { locale } = useSelector(selectLocale);
  const categoriesOrg: Dictionary<ArticleDocument[]> = {};
  for (const article of articles) {
    const lang = ((article.lang)?.split("-")) ? ((article.lang)?.split("-"))[0] : DEFAULT_LOCALE;
    const categories = (locale === DEFAULT_LOCALE) ? article.data.categories : article.data.fr_categories;

    for (const cat of categories) {
      const catName = (cat as any).category
      if (locale === lang){
        if (!categoriesOrg[catName])
        categoriesOrg[catName] = [article]
        else
          categoriesOrg[catName].push(article);
      }
    }
  }
  return categoriesOrg;
}
