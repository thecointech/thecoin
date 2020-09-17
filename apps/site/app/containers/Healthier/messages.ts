/*
 * HowItWorks Messages
 *
 * This contains all the text for the HowItWorks container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.HowItWorks';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'How It Works!',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'The Coin in 5 easy steps!',
  },
  step1: {
    id: `${scope}.step1`,
    defaultMessage: 'First, you open an account.',
  },
  step1Sub: {
    id: `${scope}.step1Sub`,
    defaultMessage: 'It’s easy! All you need is a valid referrer code.',
  },
  step2: {
    id: `${scope}.step2`,
    defaultMessage: 'Save your account',
  },
  step2Sub: {
    id: `${scope}.step2Sub`,
    defaultMessage:
      'We give you instructions on how to save your account.  To benefit from our guarantee of “the most secure account in the world”, you need to save it offline.  That’s easy, too.',
  },
  step3: {
    id: `${scope}.step3`,
    defaultMessage: 'Transfer money into your account',
  },
  step3Sub: {
    id: `${scope}.step3Sub`,
    defaultMessage:
      'Transfer money in using interac e-Transfer and an email address specific to only your account.\n\n\nYour dollars will be converted into The Coin, a digital currency based on the stockmarket, and powered by blockchain technology (which helps make it super-safe!).  Its value is tied to the best stocks on Wall Street (the S&P 500).',
  },
  step4: {
    id: `${scope}.step4`,
    defaultMessage: 'Pay bills and make purchases',
  },
  step4Sub: {
    id: `${scope}.step4Sub`,
    defaultMessage:
      'You can use The Coin pretty much the same as a regular bank account.  You can make payments on your bills, including your credit card and taxes.  The only difference is that your money keeps growing.',
  },
  step5: {
    id: `${scope}.step5`,
    defaultMessage: 'Transfer back to any Canadian bank.',
  },
  step5Sub: {
    id: `${scope}.step5Sub`,
    defaultMessage:
      'You can transfer from The Coin back to Canadian dollars at any time.  Transfer the money you need out of your account with interac e-Transfer quickly and cheaply.',
  },
});
