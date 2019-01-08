/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.components.UxPassword';

export default defineMessages({
  default: {
    id: `${scope}.default`,
    defaultMessage: 'strength', // TODO: Do we want an initial message
  },
  0: {
    id: `${scope}.score0`,
    defaultMessage: 'ineffectual',
  },
  1: {
    id: `${scope}.score1`,
    defaultMessage: 'vulnerable',
  },
  2: {
    id: `${scope}.score2`,
    defaultMessage: 'weak',
  },
  3: {
    id: `${scope}.score3`,
    defaultMessage: 'moderate',
  },
  4: {
    id: `${scope}.score4`,
    defaultMessage: 'moderate',
  },
  PasswordRequired: {
    id: `${scope}.PasswordRequired`,
    defaultMessage: "Please enter a password of at least 'moderate' strength",
  },
});
