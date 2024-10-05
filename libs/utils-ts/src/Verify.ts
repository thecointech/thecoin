import { getBytes, solidityPackedKeccak256 } from 'ethers';

type IDData = {
  given_name: string,
  family_name: string,
  DOB: string,
}

// Build a unique (mostly) ID for a user by hashing their unique info
export function buildUniqueId({given_name, family_name, DOB}: IDData ) {
  return getBytes(
    solidityPackedKeccak256(
      ["string", "string", "string"],
      [given_name.toLowerCase(), family_name.toLowerCase(), DOB.toLowerCase()]
    )
  )
}
