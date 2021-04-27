import { withIntl } from './withIntl';
import { withRouter } from './withRouter';
import { withStore } from './withStore';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  withRouter,
  withIntl,
  withStore,
];
