import { getSigner, type AccountName } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { connect } from '@thecointech/contract-base/connect';
import { MINTER_ROLE, MRFREEZE_ROLE, BROKER_ROLE, PLUGINMGR_ROLE, THECOIN_ROLE } from "../../src/constants";
import type { TheCoin } from '../../src/codegen';

async function getAddress(name: AccountName) {
  const envAddress = process.env[`WALLET_${name}_ADDRESS`];
  if (envAddress) {
    return envAddress;
  }
  const signer = await getSigner(name);
  return await signer.getAddress();
}

async function setupRole(tcCore: TheCoin, role: string, name: AccountName) {
  const address = await getAddress(name);
  const hasRole = await  tcCore.hasRole(role, address);
  log.trace(`${name} hasRole: ${hasRole}`);
  if (!hasRole) {
    await tcCore.grantRole(role, address);
    log.info(`Set ${name}: ${address}`);
  }
}

export async function assignRoles(contract: TheCoin) {
  const theCoin = await getSigner("TheCoin");
  const tcCore = connect(theCoin, contract);
  log.trace('Assigning roles...');
  const address = await theCoin.getAddress();
  const isValid = await tcCore.hasRole(THECOIN_ROLE, address);
  if (!isValid) { throw new Error (`Cannot complete role assignment, ${address} is not assigned to TheCoin Role`)};

  await setupRole(tcCore, MINTER_ROLE, "Minter");
  await setupRole(tcCore, BROKER_ROLE, "BrokerCAD");
  await setupRole(tcCore, MRFREEZE_ROLE, "Police");
  await setupRole(tcCore, PLUGINMGR_ROLE, "BrokerCAD");
}
