import { getSigner, type AccountName } from '@thecointech/signers';

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
// NOTE this contract lives here (contract-tools) because
// we don't have self-referencing in signers
export const getSignerAddress = async (name: AccountName) => {
  const envAddress = process.env[`WALLET_${name}_ADDRESS`];
  if (envAddress !== undefined) {
    return envAddress;
  }
  const signer = await getSigner("Owner");
  return await signer.getAddress();
}
