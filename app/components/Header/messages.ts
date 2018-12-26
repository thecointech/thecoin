/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.components.Header';

export default defineMessages({
  LogoAlt: {
    id: `${scope}.LogoAlt`,
    defaultMessage: 'The Coin Website',
  },
  BannerAlt: {
    id: `${scope}.BannerAlt`,
    defaultMessage: 'Which direction to you choose?',
  },
});
