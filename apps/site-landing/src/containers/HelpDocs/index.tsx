import React, { useEffect } from "react";
import { usePrismicActions } from "components/Prismic/reducer";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { FaqList } from "./FaqList";
import { RUrl } from "@thecointech/utilities/RUrl";
import { Dictionary } from "lodash";
import { FAQDocument, PrismicState } from "components/Prismic/types";
import { Welcome } from "./Welcome";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import { DEFAULT_LOCALE } from '@thecointech/shared/containers/LanguageProvider/types';



const HelpDocsInternal = (props: RouteComponentProps) => {
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
          Object.entries(categories)
            .map((entry, index) => {
              const url = buildUrl("theme-"+((entry[0])?.split("-"))[0].replace(/ /g,'')).toString()
              return <Route key={index} path={url} render={() => <FaqList menu={categories} title={entry[0]} faqs={entry[1]} />} />
            })
        }
        <Route path={buildUrl("").toString()} exact={true} render={()=> <Welcome faqs={docs.faqs} menu={categories} />} />
      </Switch>
    </>
  );
}

// https://github.com/react-boilerplate/redux-injectors/issues/16
export const HelpDocs = (props: RouteComponentProps) => {
  return <HelpDocsInternal {...props} /> // The rest of the code
}

export function buildCategories(docs: PrismicState) {
  const { faqs } = docs;
  const { locale } = useSelector(selectLocale);
  const categories: Dictionary<FAQDocument[]> = {};
  for (const faq of faqs) {
    const lang = ((faq.lang)?.split("-")) ? ((faq.lang)?.split("-"))[0] : DEFAULT_LOCALE;
    const cat = (locale === DEFAULT_LOCALE) ? faq.data.category : faq.data.fr_category;
    if (locale === lang){
      if (!categories[cat])
        categories[cat] = [faq]
      else
        categories[cat].push(faq);
    }
  }
  return categories;
}
