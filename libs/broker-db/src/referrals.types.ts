import { buildConverter } from "./converter";

// This is the list of all legal referrers.
export type VerifiedReferrer = {
  address: string;    // This address of the referrer
  signature: string;  // TheCoin signature for verification
}

export const referrerConverter = buildConverter<VerifiedReferrer>();
