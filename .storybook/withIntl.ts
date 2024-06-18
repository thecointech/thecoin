import {translations} from '@thecointech/site-landing/src/translations'

const getMessages = (locale) => translations[locale];

export const intl = {
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  getMessages,
}

