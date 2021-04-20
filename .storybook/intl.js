import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import {translations} from '@thecointech/site-landing/src/translations'

const getMessages = (locale) => translations[locale];

// Set intl configuration
setIntlConfig({
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    getMessages,
});

export const withTranslations = withIntl;
