import React, { useEffect } from "react";
import { usePrismicActions } from "components/Prismic/reducer";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { FAQs } from "./FAQs";
import { RUrl } from "@thecointech/utilities/RUrl";
import { Dictionary } from "lodash";
import { FAQDocument, PrismicState } from "components/Prismic/types";
import { Welcome } from "./Welcome";


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
    console.log(actions.fetchFaqs())
  }, []);

  const categories = buildCategories(docs);
  console.log("categories=======",categories)

  const menu = <ul>
                { Object.entries(categories)
                    .map((entry) => {
                      //const url = buildUrl(entry[0]).toString()
                      //console.log("categories=============",index,url,entry)
                      return <li>{entry[0]}</li>
                    })}
                </ul>
console.log("categories categories", menu,categories)
  return (
    <>
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
        {console.log("categories docs.faqs", docs.faqs)}
        <Route path={buildUrl("").toString()} exact={true} render={()=> <Welcome faqs={docs.faqs} />} />
      </Switch>
    </>
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
