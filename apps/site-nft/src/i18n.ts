/* eslint-disable global-require */
/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 */
if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/dist/locale-data/en'); // Add locale data for en
  require('@formatjs/intl-pluralrules/dist/locale-data/fr'); // Add locale data for fr
}

interface Messages {
  [index:string]: string;
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enTranslationMessages: Messages = require('./translations/en.json');
const frTranslationMessages: Messages = require('./translations/fr.json');

export const DEFAULT_LOCALE = 'en';
export const appLocales = [
  'en',
  'fr'
];

export const translationMessages = {
  en: enTranslationMessages,
  fr: frTranslationMessages,
};
