import { type ComposeClient, loadEncrypted, setEncrypted } from "@thecointech/idx";
import { AccountDetails } from "@thecointech/account";

// We are legally required to be able to retrieve the account details
const recipients = process.env.WALLET_CeramicValidator_DID
  ? [process.env.WALLET_CeramicValidator_DID]
  : undefined;

export const setDetails = (idx: ComposeClient, details: AccountDetails) =>
  setEncrypted(idx, details, recipients);

export const loadDetails = async (idx: ComposeClient) =>
  loadEncrypted<AccountDetails>(idx);
