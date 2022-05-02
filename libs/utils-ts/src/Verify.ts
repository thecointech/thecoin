import { keccak256 } from '@ethersproject/solidity';

type IDData = {
  given_name: string,
  family_name: string,
  dob: string,
}
export function buildUniqueId({given_name, family_name, dob}: IDData ) {
  return keccak256(
    ["string", "string", "string"],
    [given_name.toLowerCase(), family_name.toLowerCase(), dob.toLowerCase()]
  )
}
