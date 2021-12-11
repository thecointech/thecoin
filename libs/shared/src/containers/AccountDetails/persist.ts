import { SelfID, loadEncrypted, setEncrypted } from "@thecointech/idx";
import { AccountDetails } from "@thecointech/account";

export const setDetails = (idx: SelfID, details: AccountDetails): Promise<any> =>
  setEncrypted(idx, "AccountDetails", details);

export const loadDetails = async (idx: SelfID) =>
  loadEncrypted<AccountDetails>(idx, "AccountDetails");
