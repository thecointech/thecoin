import { intl } from './withIntl';
import { withRouter } from './withRouter';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  intl
}

export const decorators = [
  withRouter,
];
