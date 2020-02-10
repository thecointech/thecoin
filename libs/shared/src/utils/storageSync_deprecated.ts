import { Wallet } from "ethers";
import { AccountState, DefaultAccountValues } from "../containers/Account/types";
import { TheSigner, AnySigner } from "../SignerIdent";
import { NormalizeAddress } from "@the-coin/utilities";

// NOTE: These prefixes must be all equal length
enum Prefix {
  SIGNER = 'lcl_sgn_',
  WALLET = 'lcl_wal_',
}

function Strip(name: string): string {
  return (name.startsWith(Prefix.WALLET) || name.startsWith(Prefix.SIGNER)) ?
    name.substring(Prefix.WALLET.length) :
    ''
}
const Pad = (name: string, prefix: Prefix) => prefix + name;

// Read stored signer/wallet from memory
function Deprecated_GetStoredData(name: string, prefix: Prefix): AnySigner|null {
  const storedItem = localStorage.getItem(Pad(name, prefix));
  if (storedItem !== null) {
    const r = JSON.parse(storedItem) as AnySigner
    if (r.address)
      return r;
  }
  return null;
}

export const Deprecated_GetStoredWallet = (name: string) => Deprecated_GetStoredData(name, Prefix.WALLET) as Wallet;
export const Deprecated_GetStoredSigner = (name: string) => Deprecated_GetStoredData(name, Prefix.SIGNER) as TheSigner;
export const Deprecated_GetStored = (raw: string) : AccountState|null => {
  const name = Strip(raw)
  const signer = Deprecated_GetStoredWallet(name) ?? Deprecated_GetStoredSigner(name)!;
  if (!signer)
    return null;

  const normalizedAddress = NormalizeAddress(signer.address)
  const account = {
    ...DefaultAccountValues,
    address: normalizedAddress,
    name,
    signer,
  };

  // Immediately save back using address and remove named version
  localStorage.removeItem(raw);
  localStorage.setItem(normalizedAddress, JSON.stringify(account));

  return account;
};