import { LedgerSigner } from "@ethers-ext/signer-ledger";
import HIDTransport from "@ledgerhq/hw-transport-node-hid";
import { log } from "@thecointech/logging";
import { getProvider } from "@thecointech/ethers-provider";
import type { AccountName } from './names';

export async function loadHardware(name: AccountName) {
  // Leave a trace just in case someone tries this in an unexpected situation
  log.info(`Loading hardware wallet: ${name}`);

  const signer = new LedgerSigner(HIDTransport);
  const address = await signer.getAddress();
  if (address != process.env[`WALLET_${name}_ADDRESS`]) {
    throw new Error(`Cannot load ${name} - matching hardware device is not connected`);
  }

  return signer.connect(await getProvider());
}
