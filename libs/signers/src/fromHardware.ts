import { AccountName } from './names';
import { LedgerSigner } from "@ethersproject/hardware-wallets";
import { log } from "@thecointech/logging";

export async function loadHardware(name: AccountName) {
  // Leave a trace just in case someone tries this in an unexpected situation
  log.info(`Loading hardware wallet: ${name}`);

  const signer = new LedgerSigner();
  const address = await signer.getAddress();
  if (address != process.env[`WALLET_${name}_ADDRESS`]) {
    throw new Error(`Cannot load ${name} - matching hardware device is not connected`);
  }
  return signer;
}
