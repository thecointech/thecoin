/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.HomePage';

export default defineMessages({
  headerTopLeft: {
    id: `${scope}.headerTopLeft`,
    defaultMessage:
      '{bold} here is backed by the S&P500. Annual return of 9.8% over the last 90 years Fight inflation and maintain purchasing power.',
    description: 'TheCoin',
  },
  learnMore: {
    id: `${scope}.learnMore`,
    defaultMessage: 'LEARN MORE',
  },
  headerTopCenter: {
    id: `${scope}.headerTopCenter`,
    defaultMessage:
      'Creating an account with {bold} WILL help stop climate change.',
    description: 'TheCoin',
  },
  headerTopRight: {
    id: `${scope}.headerTopRight`,
    defaultMessage:
      'You get 90% of the dividends. We keep 10% and put it towards fighting climate change: {bold}.',
    description: 'Tree planting',
  },
  subscribe: {
    id: `${scope}.subscribe`,
    defaultMessage:
      'Subscribe to learn how you can help fight climate change with {bold}. Subscribe to our mailing list today.',
    description: 'TheCoin',
  },
  blurbGrow: {
    id: `${scope}.blurbGrow`,
    defaultMessage:
      'Grow your wealth alongside Wall Street without taking away access to your finances.',
  },
  blurbSpend: {
    id: `${scope}.blurbSpend`,
    defaultMessage:
      'Spend your money at the supermarket or your favorite restaurant.',
  },
  blurbFees: {
    id: `${scope}.blurbFees`,
    defaultMessage:
      "All the while paying no fees whatsoever, and enjoying the world's most secure accounts.",
  },
});
