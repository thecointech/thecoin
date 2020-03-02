/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.components.Header';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'What would you like to know?',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'See what interests you from the menu on the left',
  },
  blurb: {
    id: `${scope}.blurb`,
    defaultMessage: 'Or, for a quick overview of our company try the below items',
  },
});
