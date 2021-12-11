import { log } from '@thecointech/logging';
import { GetContract } from '../src';
import {assignRoles} from './assignRoles';

//
// Seed a new contract.  This script should
// only be executed once per deployment.
// Moved out of migrations because migrations
// only allows the use of a single hardware wallet,
// and both TheCoin & Owner will be hardware in prod
(async () => {
  const method = process.env.DEPLOY_CONTRACT_INIT;
  const contract = GetContract();
  log.info(`Initializing ${contract.address}: method: ${method}`);
  switch (method) {
    case 'clone': {
      await assignRoles(contract);
      const { Processor } = await import('./clone');
      const p = new Processor();
      await p.init(contract);
      await p.process();
      break;
    }
    case 'seed': {
      await assignRoles(contract);
      const { devliveDistribution } = await import('./devlive');
      await devliveDistribution();
      break;
    }
    default:
      log.error("No initialization method chosen, exiting")
  }
})();
