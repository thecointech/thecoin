import React, { useEffect } from "react";
import { usePrismicActions } from "components/Prismic/reducer";
import { useSidebar } from "@the-coin/shared/containers/PageSidebar/actions";
import { SidebarMenuItem } from "@the-coin/shared/containers/PageSidebar/types";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { FAQs } from "./FAQs";
import { RUrl } from "@the-coin/utilities/RUrl";
import { Dictionary } from "lodash";
import { FAQDocument, PrismicState } from "components/Prismic/types";
import { Welcome } from "./Welcome";

const FAQS_KEY = "faqItems";

const HelpDocsInternal = (props: RouteComponentProps) => {
  const actions = usePrismicActions();
  const sidebarActions = useSidebar();
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
  useEffect(() => {
    sidebarActions.addGenerator(
      FAQS_KEY,
      () => {

        const items: SidebarMenuItem[] = [

          ...Object.keys(categories)
            .sort()
            .map(category => (
              {
                link: {
                  name: category,
                  to: buildUrl(category)
                }
              }
            ))
        ]
        return items;
      });
    return () => sidebarActions.removeGenerator(FAQS_KEY);
  }, [docs]);

  return (
    <Switch>
      {
        Object.entries(categories)
          .map((entry, index) => {
            const url = buildUrl(entry[0]).toString()
            return <Route key={index} path={url} render={() => <FAQs faqs={entry[1]} />} />
          })
        // docs.faqs.map(a => 
        //   <Route key={a.id} path={buildUrl(a.id).toString()} render={()=> <Article {...a} />} />
        // )
        //<Route path={buildUrl("").toString()} exact={true} render={()=> <FAQs faqs={docs.faqs} />} />
      }
      <Route path={buildUrl("").toString()} exact={true} render={()=> <Welcome faqs={docs.faqs} />} />
    </Switch>
  );
}

// https://github.com/react-boilerplate/redux-injectors/issues/16
export const HelpDocs = (props: RouteComponentProps) => {
  return <HelpDocsInternal {...props} /> // The rest of the code
}

function buildCategories(docs: PrismicState) {
  const { faqs } = docs;
  const categories: Dictionary<FAQDocument[]> = {};
  for (const faq of faqs) {
    const cat = faq.data.category;
    if (!categories[cat])
      categories[cat] = [faq]
    else
      categories[cat].push(faq);
  }
  return categories;
}