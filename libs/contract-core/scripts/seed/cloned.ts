import { log } from '@thecointech/logging';
import { GetContract } from '../../src';
import {assignRoles} from './assignRoles';
// import {Processor} from './clone';
//
// Seed a new contract.  This script should
// only be executed once per deployment.

const contract = await GetContract();
log.info(`Initializing ${await contract.getAddress()} with cloned values`);
throw new Error("No longer working (possibly remove this)");
await assignRoles(contract);

// const p = new Processor();
// await p.init(contract);
// await p.process();

