import { log } from '@thecointech/logging';
import { THECOIN_ROLE } from '../src';
import { getContract } from './contract';

export async function grantSuperPermissions() {
  const tcCore = await getContract("TheCoin");
  const xaAddress = process.env.WALLET_BrokerTransferAssistant_ADDRESS!;
  // We use xa to do all clone transfers, so temporarily grant super-privilges
  if (!await tcCore.hasRole(THECOIN_ROLE, xaAddress)) {
    const granting = await tcCore.grantRole(THECOIN_ROLE, xaAddress);
    log.trace(`Granting super-privilges: ${granting.hash}`);
    granting.wait(1);
  }
  log.debug(`Permissions setup complete`);
}

export async function revokeSuperPermissions() {
  const tcCore = await getContract("TheCoin");
  const xaAddress = process.env.WALLET_BrokerTransferAssistant_ADDRESS!;
  const revoking = await tcCore.revokeRole(THECOIN_ROLE, xaAddress);
  log.trace(`Revoking super-privilges: ${revoking.hash}`);
  revoking.wait(1);
  log.debug('All Done');
}
