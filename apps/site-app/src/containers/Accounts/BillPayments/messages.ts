/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.accounts.Transfer';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Bill Payments',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "You can pay your bills directly from The Coin.",
  },
  transferOutHeader: {
    id: `${scope}.transferHeader`,
    defaultMessage: "Processing Bill Payment...",
  },
  step1: {
    id: `${scope}.step1`,
    defaultMessage: "Step 1 of 3:\nChecking payment availability...",
  },
  step2: {
    id: `${scope}.step2`,
    defaultMessage: "Step 2 of 3:\nSending bill payment to our servers...",
  },
  step3: {
    id: `${scope}.step3`,
    defaultMessage: "Step 3 of 3:\nWaiting for the bill payment to be accepted (check progress {link})...",
  },
  transferOutProgress: {
    id: `${scope}.billPaymentProgress`,
    defaultMessage: "Please wait, we are sending your order to our servers...",
  },

  accountNumer: {
    id: `${scope}.accountNumer`,
    defaultMessage: "Payee Account Number"
  },

  invalidVisaChars: {
    id: `${scope}.invalidVisaCardLength`,
    defaultMessage: "Your card number should be 16 digits long"
  },
  invalidVisaAccount: {
    id: `${scope}.invalidVisaAccount`,
    defaultMessage: "The given number is not a valid visa card"
  },

  invalidNumericChars: {
    id: `${scope}.invalidNumericChars`,
    defaultMessage: "You have entered {len} numbers, but your account requires {max}"
  },
  invalidNumericLength: {
    id: `${scope}.invalidNumericLength`,
    defaultMessage: "Invalid account number"
  }
});
