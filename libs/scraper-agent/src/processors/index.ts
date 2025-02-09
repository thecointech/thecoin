import { AccountsSummary } from "./accountSummary";
import { CookieBanner } from "./cookieBanner";
import { CreditAccountDetails } from "./creditAccountDetails";
import { Landing } from "./landing";
import { Login } from "./login";
import { SendETransfer } from "./sendETransfer";
import { TwoFA } from "./twofa";

export const SectionProcessors = {
  CookieBanner: CookieBanner,
  Landing: Landing,
  Login: Login,
  TwoFA: TwoFA,
  AccountsSummary: AccountsSummary,
  CreditAccountDetails: CreditAccountDetails,
  SendETransfer: SendETransfer,
} as const;

export type SectionType = keyof typeof SectionProcessors;
