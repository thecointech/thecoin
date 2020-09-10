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

import { makeSelectLocale } from './selectors';

export interface Props {
  locale: string;
  messages: { [id: string]: string };
  children?: React.ReactNode;
}

function loadLocaleData(locale: string) {
  switch (locale) {
    case 'fr':
      return import('./../../compiled-lang/fr.json')
    default:
      return import('./../../compiled-lang/en.json')
  }
}

const stateSelector = createSelector(
  makeSelectLocale(),
  locale => ({
    locale,
  }),
);

export default function LanguageProvider(props: Props) {
  const { locale } = useSelector(stateSelector);

  return (
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={props.messages}
    >
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}
