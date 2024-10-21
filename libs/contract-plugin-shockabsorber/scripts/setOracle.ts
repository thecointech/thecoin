import { getSigner } from '@thecointech/signers';
import { getContract } from '../src';
import { getContract as getOracle } from '@thecointech/contract-oracle';

const brokerCAD = await getSigner("BrokerCAD");
const shockAbsorber = await getContract();
const contract = await getOracle();

const r = await shockAbsorber.connect(brokerCAD).setOracle(contract);
console.log(`Updated Oracle: ${r.hash}`);
await r.wait(2);
console.log("Complete")
