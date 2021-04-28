import { withIntl } from './withIntl';
import { withRouter } from './withRouter';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  withRouter,
  withIntl,
];
