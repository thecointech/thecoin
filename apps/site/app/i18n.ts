/* eslint-disable global-require */
/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 *   IMPORTANT: This file is used by the internal build
 *   script `extract-intl`, and must use CommonJS module syntax
 *   You CANNOT use import/export in this file.
 */
if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/dist/locale-data/en'); // Add locale data for en
  // require('@formatjs/intl-pluralrules/dist/locale-data/de'); // Add locale data for de
}
// if (!Intl.RelativeTimeFormat) {
//   require('@formatjs/intl-relativetimeformat/polyfill');
//   require('@formatjs/intl-relativetimeformat/dist/locale-data/de'); // Add locale data for de
// }

interface Messages {
  [index:string]: string;
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enTranslationMessages: Messages = require('./translations/en.json');

export const DEFAULT_LOCALE = 'en';

// prettier-ignore
export const appLocales = [
  'en',
];



export const formatTranslationMessages = (locale: string, messages: Messages) => {
  const defaultFormattedMessages = locale !== DEFAULT_LOCALE
    ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
    : {};
  const flattenFormattedMessages = (formattedMessages: Messages, key: string): Messages => {
    const formattedMessage = !messages[key] && locale !== DEFAULT_LOCALE
      ? defaultFormattedMessages[key]
      : messages[key];
    return { ...formattedMessages, [key]: formattedMessage };
  };
  return Object.keys(messages).reduce(flattenFormattedMessages, {});
};

export const translationMessages = {
  en: formatTranslationMessages('en', enTranslationMessages),
};
