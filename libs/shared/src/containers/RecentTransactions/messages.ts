/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from "react-intl";

export const scope = "app.containers.Balance";

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: "You have: ${balance, number, CAD}"
  },
  blurbGrow: {
    id: `${scope}.blurbGrow`,
    defaultMessage:
      "Grow your wealth alongside Wall Street without taking away access to your finances."
  },
  blurbSpend: {
    id: `${scope}.blurbSpend`,
    defaultMessage:
      "Spend your money at the supermarket or your favorite restaurant."
  },
  blurbFees: {
    id: `${scope}.blurbFees`,
    defaultMessage:
      "All the while paying no fees whatsoever, and enjoying the world's most secure accounts."
  }
});
