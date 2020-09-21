/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { IntlProvider } from 'react-intl';
//import { setLocale } from './reducer';
import { makeSelectLocale } from './selector';

export interface Props {
  messages: { [locale: string]: { [id: string]: string } };
  children?: React.ReactNode;
}

const stateSelector = createSelector(
  makeSelectLocale(),
  locale => ({
    locale,
  }),
);

export default function LanguageProvider(props : Props) {
  //const locale =  window.location.search.split('=')[1] ?? useSelector(stateSelector);
  const { locale } = useSelector(stateSelector);

  return (
    <IntlProvider
      locale={locale}
      key={locale}
      messages={props.messages[locale]}
    >
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}
