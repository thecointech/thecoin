import { ConnectionValues } from "@thecointech/types";
import { ValidationError } from "./errors";
import { HDNodeWallet } from "ethers";
import { NormalizeAddress, IsValidAddress } from "@thecointech/utilities/Address";

export function validate(payload: any, currentState: string): ConnectionValues {

  const { state, siteOrigin, address, timestamp, phrase, path, locale, name, walletFile } = payload as ConnectionValues;
  if (!state || state !== currentState) {
    throw new ValidationError('Invalid state body');
  }
  if (!address || !IsValidAddress(address)) {
    throw new ValidationError('Missing address');
  }
  if (!timestamp || !isFresh(timestamp)) {
    throw new ValidationError('Stale or missing timestamp');
  }
  if (!siteOrigin || typeof siteOrigin !== 'string') {
    throw new ValidationError('Missing siteOrigin');
  }
  // Best-effort origin check (no backend): ensure same origin prefix as configured site
  const expected = process.env.URL_SITE_APP || '';
  if (!expected || getOrigin(expected) !== getOrigin(siteOrigin)) {
    throw new ValidationError('Unexpected site origin');
  }

  // Validate account payload: exactly one active account
  if (!(phrase && path && locale)) {
    throw new ValidationError('Missing mnemonic');
  }

  // Try to create wallet to validate it matches address
  const wallet = HDNodeWallet.fromPhrase(phrase, undefined, path);
  if (NormalizeAddress(wallet.address) !== NormalizeAddress(address)) {
    throw new ValidationError('Address does not match mnemonic');
  }

  // We assume the walletFile is valid, as there is pretty
  // much no benefit to messing with it.
  if (!walletFile?.toLowerCase().includes(wallet.address.toLowerCase().slice(2))) {
    throw new ValidationError('Invalid walletFile');
  }

  return {
    state,
    siteOrigin,
    name,
    address,
    timestamp,
    phrase,
    path,
    locale,
    walletFile,
  };
}


function isFresh(timestamp: string, skewMs = 5 * 60_000) {
  const t = Number(timestamp);
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  return Math.abs(now - t) <= skewMs;
}

function getOrigin(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}
