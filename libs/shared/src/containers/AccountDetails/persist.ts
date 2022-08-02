import { SelfID, loadEncrypted, setEncrypted } from "@thecointech/idx";
import { AccountDetails } from "@thecointech/account";

// We are legally required to be able to retrieve the account details
const recipients = process.env.WALLET_BrokerCAD_DID
  ? [process.env.WALLET_BrokerCAD_DID]
  : undefined;

export const setDetails = (idx: SelfID, details: AccountDetails): Promise<any> =>
  setEncrypted(idx, "AccountDetails", details, recipients);

export const loadDetails = async (idx: SelfID) =>
  loadEncrypted<AccountDetails>(idx, "AccountDetails");
