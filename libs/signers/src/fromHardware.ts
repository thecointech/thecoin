import { AccountName } from './names';
import { LedgerSigner } from "@thecointech/hardware-wallet";
import { log } from "@thecointech/logging";
import { getProvider } from "@thecointech/ethers-provider";

export async function loadHardware(name: AccountName) {
  // Leave a trace just in case someone tries this in an unexpected situation
  log.info(`Loading hardware wallet: ${name}`);

  const signer = new LedgerSigner();
  const address = await signer.getAddress();
  if (address != process.env[`WALLET_${name}_ADDRESS`]) {
    throw new Error(`Cannot load ${name} - matching hardware device is not connected`);
  }
  return signer.connect(getProvider());
}
