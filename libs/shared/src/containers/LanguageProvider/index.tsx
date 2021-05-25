/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `src/translations`)
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { selectLocale } from './selector';
import { Languages } from './types';
import { useLanguageProvider } from './reducer';

export * from './types';

export interface Props {
  languages: Languages;
  children?: React.ReactNode;
}

export function LanguageProvider(props : Props) {
  useLanguageProvider();
  const { locale } = useSelector(selectLocale);
  return (
    <IntlProvider
      locale={locale}
      key={locale}
      messages={props.languages[locale]}
      defaultLocale="en-CA"
    >
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}
