import { log } from '@thecointech/logging';
import { GetContract } from '../../src';
import {assignRoles} from './assignRoles';
import {Processor} from './clone';
//
// Seed a new contract.  This script should
// only be executed once per deployment.

const contract = await GetContract();
log.info(`Initializing ${contract.address} with cloned values`);
await assignRoles(contract);

const p = new Processor();
await p.init(contract);
await p.process();

