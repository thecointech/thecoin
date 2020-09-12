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
import ReactDOM from 'react-dom';
import { App } from 'containers/App';


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

export default function LanguageProvider(props: Props) {

  return (
    <IntlProvider
      locale={props.locale}
      defaultLocale="fr"
      messages={props.messages}
    >
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}

export async function bootstrapApplication(locale: string, mainDiv: Element | null) {
  const messages = await loadLocaleData(locale)
  console.log(messages);
  ReactDOM.render(<App locale={locale} messages={messages} />, mainDiv)
}
