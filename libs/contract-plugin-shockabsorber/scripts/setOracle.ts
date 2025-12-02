import { getSigner } from '@thecointech/signers';
import { ContractShockAbsorber } from '../src';
import { ContractOracle } from '@thecointech/contract-oracle';

const brokerCAD = await getSigner("BrokerCAD");
const shockAbsorber = await ContractShockAbsorber.get();
const oracle = await ContractOracle.get();

const r = await shockAbsorber.connect(brokerCAD).setOracle(oracle);
console.log(`Updated Oracle: ${r.hash}`);
await r.wait(2);
console.log("Complete")
