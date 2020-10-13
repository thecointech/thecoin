/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { selectLocale } from './selector';

export type Messages = {
  [locale: string]: { [id: string]: string };
}

export interface Props {
  messages: Messages;
  children?: React.ReactNode;
}

export function LanguageProvider(props : Props) {
  const { locale } = useSelector(selectLocale);
  
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
