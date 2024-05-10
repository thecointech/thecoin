import { getSigner } from '@thecointech/signers';
import { getContract } from '../src';
import { getContract as getOracle } from '@thecointech/contract-oracle';

const owner = await getSigner("Owner");
const converter = await getContract();
const contract = await getOracle();

const r = await converter.connect(owner).setOracle(contract);
console.log(`Updated Oracle: ${r.hash}`);
await r.wait(2);
console.log("Complete")
