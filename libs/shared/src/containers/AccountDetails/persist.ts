import { IDX } from "@ceramicstudio/idx";
import { loadEncrypted, setEncrypted } from "@thecointech/idx";
import { AccountDetails } from "@thecointech/account";

export const setDetails = (idx: IDX, details: AccountDetails) =>
  setEncrypted(idx, "details", details);

export const loadDetails = async (idx: IDX) =>
  loadEncrypted<AccountDetails>(idx, "details");
