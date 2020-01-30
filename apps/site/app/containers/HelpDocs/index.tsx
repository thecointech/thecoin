import React, { useEffect } from "react";
import { usePrismic, usePrismicActions } from "containers/Prismic/reducer";
import { useSidebar } from "@the-coin/shared/containers/PageSidebar/actions";
import { SidebarMenuItem } from "@the-coin/shared/containers/PageSidebar/types";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Switch, Route, RouteComponentProps } from "react-router";
import { Article } from "./Article";
import { FAQs } from "./FAQs";
import { RUrl } from "@the-coin/utilities/RUrl";

const FAQS_KEY = "faqItems";

const HelpDocsInternal = (props: RouteComponentProps) => {
  const actions = usePrismicActions();
  const sidebarActions = useSidebar();
  const docs = useSelector((s: ApplicationRootState) => s.documents);
  const {match} = props;
  const buildUrl = (id: string) => new RUrl(match.url, id);


  useEffect(() => {
    actions.fetchFaqs();
  }, []);

  useEffect(() => {
    sidebarActions.addGenerator(
      FAQS_KEY,
      () => {
        let items: SidebarMenuItem[] = [
          
          ...docs.articles.map(d => (
            {
              link: {
                name: d.data.questions 
                  ? d.data.questions[0].text
                  : "Missing Title",
                to: buildUrl(d.id)
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
        docs.articles.map(a => 
          <Route key={a.id} path={buildUrl(a.id).toString()} render={()=> <Article {...a} />} />
        )
      }
      <Route path={buildUrl("").toString()} exact={true} render={()=> <FAQs faqs={docs.faqs} />} />
    </Switch>
  );
}

// https://github.com/react-boilerplate/redux-injectors/issues/16
export const HelpDocs = (props: RouteComponentProps) => {
  usePrismic();
  return <HelpDocsInternal {...props} /> // The rest of the code
}