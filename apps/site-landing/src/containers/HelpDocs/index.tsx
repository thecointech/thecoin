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
    actions.fetchFaqs();
  }, []);

  const categories = buildCategories(docs);
console.log("categories======",categories)
  return (
    <>
      <Switch>
        {
          Object.entries(categories)
            .map((entry, index) => {
              const url = buildUrl(entry[0]).toString()
              return <Route key={index} path={url} render={() => <FaqList title={entry[0]} faqs={entry[1]} />} />
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
    //const key = `${locale}+"_category"`;
    const cat = (locale === DEFAULT_LOCALE) ? faq.data.category : faq.data.fr_category; //["level" + (selectedItem.Level+1)]
    console.log(locale,lang,locale===lang)
    if (locale === lang){
      if (!categories[cat])
        categories[cat] = [faq]
      else
        categories[cat].push(faq);
    }
  }
  console.log(categories)
  return categories;
}
