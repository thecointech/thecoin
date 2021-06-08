import React, { useEffect } from "react";
import { usePrismicActions } from "components/Prismic/reducer";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { FaqList } from "./FaqList";
import { RUrl } from "@thecointech/utilities/RUrl";
import { Dictionary } from "lodash";
import { ArticleDocument, FAQDocument, PrismicState } from "components/Prismic/types";
import { Welcome } from "./Welcome";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import { DEFAULT_LOCALE } from '@thecointech/shared/containers/LanguageProvider/types';



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

  console.log("docs==",docs)
  const categories = buildCategories(docs);
  return (
    <>
      <Switch>
        {
          Object.entries(categories)
            .map((entry, index) => {
              //const url = "cat"+((entry[0]).split("-"))[0].replace(/\s/g, '').toString()
              const url = buildUrl("theme-"+((entry[0])?.split("-"))[0].replace(/ /g,'')).toString()
              return <Route key={index} path={url} render={() => <FaqList menu={categories} title={entry[0]} faqs={entry[1]} />} />
            })
        }
        <Route path={buildUrl("").toString()} exact={true} render={()=> <Welcome faqs={docs.articles} menu={categories} />} />
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
      if (locale === lang){
        if (!categoriesOrg[cat])
        categoriesOrg[cat] = [article]
        else
          categoriesOrg[cat].push(article);
      }
    }
  }
  return categoriesOrg;
}
