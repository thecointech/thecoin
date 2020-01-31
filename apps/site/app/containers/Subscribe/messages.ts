/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Subscribe';

export default defineMessages({
  subscribe: {
    id: `${scope}.subscribe`,
    defaultMessage: 'Join our beta program and maximize your future with {bold}.',
    description: 'TheCoin',
  },
});
