import {translations} from '@thecointech/site-landing/src/translations'

const locales = ['en', 'fr'];

const messages = locales.reduce((acc, lang) => ({
  ...acc,
  [lang]: translations[lang],
}), {});

export const reactIntl = {
  defaultLocale: 'en',
  locales,
  messages,
};
