import React, { useEffect } from 'react';
import { About as AboutContent } from '@thecointech/site-prismic/components';
import { Prismic } from '../../components/Prismic';
import { useSelector } from "react-redux";
import { selectLocale } from '@thecointech/redux-intl';
import type { ApplicationRootState } from 'types';

export const About = () => {

  const actions = Prismic.useApi();
  const { locale } = useSelector(selectLocale);
  const about = useSelector(
    (state: ApplicationRootState) =>
      state.documents[locale].pages.get("about"),
  );

  useEffect(() => {
    actions.fetchStaticPage("about", locale);
  }, [actions, locale]);

  if (!about) {
    return null; // Prefer the project's existing loading component here.
  }

  return <AboutContent document={about} />;
};
