/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `src/translations`)
 */

import React, { type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { selectLocale } from './selector';
import { Languages } from './types';
import { LanguageProviderReducer } from './reducer';

export * from './reducer';
export * from './selector';
export type * from './types';

export interface Props {
  languages: Languages;
}

export function LanguageProvider({children, languages}: PropsWithChildren<Props>) {
  LanguageProviderReducer.useStore();
  const { locale } = useSelector(selectLocale);
  return (
    <IntlProvider
      locale={locale}
      key={locale}
      messages={languages[locale]}
      defaultLocale="en"
    >
      {React.Children.only(children)}
    </IntlProvider>
  );
}
