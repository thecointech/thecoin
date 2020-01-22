import React, { useEffect } from "react";
import { usePrismic, usePrismicActions } from "containers/Prismic/reducer";
import { useSidebar } from "@the-coin/shared/containers/PageSidebar/actions";
import { SidebarMenuItem } from "@the-coin/shared/containers/PageSidebar/types";
import { ApplicationRootState } from "types";
import { useSelector } from "react-redux";
import { Segment } from "semantic-ui-react";

const FAQS_KEY = "faqItems";

export const FAQs = () => {
  usePrismic();
  const actions = usePrismicActions();
  const sidebarActions = useSidebar();
  const docs = useSelector((s: ApplicationRootState) => s.documents);

  useEffect(() => {actions.fetchFaqs()}, [actions]);
  useEffect(() => {
    console.log("setting generator");
    sidebarActions.addGenerator(
      FAQS_KEY,
      (): SidebarMenuItem[] => {
      return docs.faqs.map(d => (
        {
          link: {
            name: d.id,
            to: d.id
          }
        }
      ));
    });
    return () => sidebarActions.removeGenerator(FAQS_KEY);
  }, [docs]);
  

  return (
    <>
      {docs.faqs.map(faq => <Segment key={faq.id}>Your FAQ is: {JSON.stringify(faq)}</Segment>)}
    </>
  );
}