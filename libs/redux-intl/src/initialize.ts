/* eslint-disable global-require */

import { Languages, Locale, Messages } from "./types";
import { DEFAULT_LOCALE } from "./reducer";

if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/dist/locale-data/en'); // Add locale data for en
  require('@formatjs/intl-pluralrules/dist/locale-data/fr'); // Add locale data for fr
}
// if (!Intl.RelativeTimeFormat) {
//   require('@formatjs/intl-relativetimeformat/polyfill');
//   require('@formatjs/intl-relativetimeformat/dist/locale-data/de'); // Add locale data for de
// }


const formatTranslationMessages = (messages: Messages, defaultMessages: Messages) =>
  Object.keys(messages).reduce((formattedMessages: Messages, key: string): Messages => ({
    ...formattedMessages,
    [key]: messages[key] ?? defaultMessages[key]
  }), {});

export const formatTranslations = (languages: Languages) => {
  const r: Languages = { en: {}, fr: {} };

  // initialize default messages
  const defaultFormattedMessages = formatTranslationMessages(languages[DEFAULT_LOCALE], {})
  r[DEFAULT_LOCALE] = defaultFormattedMessages;

  // reduce remaining messages, substituting default messages when no translation exists
  for (const code in languages) {
    var c = code as Locale;
    var formatted = formatTranslationMessages(languages[c], defaultFormattedMessages);
    r[c] = formatted;
  }
  return r;
}
