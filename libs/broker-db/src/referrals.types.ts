import { buildConverter } from "./converter.js";

// This is the list of all legal referrers.
export type VerifiedReferrer = {
  address: string;    // This address of the referrer
  signature: string;  // TheCoin signature for verification
  offset: number;     // The offset searched to find a unique pattern in address
}

export const referrerConverter = buildConverter<VerifiedReferrer>();
