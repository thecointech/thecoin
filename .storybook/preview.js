import { withIntl } from './withIntl';
import { withRouter } from './withRouter';
import { init } from '@thecointech/logging';

// Log everything
init("Storybook", 0);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  withRouter,
  withIntl,
];
