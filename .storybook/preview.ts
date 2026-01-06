import { reactIntl } from './withIntl';
import { withRouter } from './withRouter';

export const initialGlobals = {
  locale: reactIntl.defaultLocale,
  locales: {
    en: 'English',
    fr: 'Français',
  },
};

export const parameters = {
  reactIntl,
};

export const decorators = [
  withRouter,
];

export const tags = ['autodocs'];
