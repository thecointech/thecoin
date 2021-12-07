import { getSigner, AccountName } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { ConnectContract } from '../src';
import { MINTER_ROLE, MRFREEZE_ROLE, BROKER_ROLE, PLUGINMGR_ROLE, THECOIN_ROLE } from "../src/constants";
import { TheCoin } from '../src/types';

async function setupRole(tcCore: TheCoin, role: string, name: AccountName) {
  const signer = await getSigner(name);
  const address = await signer.getAddress();
  await tcCore.grantRole(role, address);
  log.info(`Set ${name}: ${address}`);
}

export async function assignRoles(contract: TheCoin) {
  const theCoin = await getSigner("TheCoin");
  const tcCore = contract.connect(theCoin);

  log.trace('Assigning roles...');
  const address = await theCoin.getAddress();
  const isValid = await tcCore.hasRole(THECOIN_ROLE, address);
  if (!isValid) { throw new Error (`Cannot complete role assignment, ${address} is not assigned to TheCoin Role`)};

  await setupRole(tcCore, MINTER_ROLE, "Minter");
  await setupRole(tcCore, BROKER_ROLE, "BrokerCAD");
  await setupRole(tcCore, MRFREEZE_ROLE, "Police");
  await setupRole(tcCore, PLUGINMGR_ROLE, "TheCoin");
}
