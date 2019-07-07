/*
 * NotFoundPage Messages
 *
 * This contains all the text for the NotFoundPage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.UnderConstruction';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This bit is not quite ready!',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'We are working hard to bring it to you though',
  },
  suggestEmail: {
    id: `${scope}.suggestEmail`,
    defaultMessage: 'in the meantime, feel free to contact ',
  },
});
