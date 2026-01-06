import { getSigner } from '@thecointech/signers';
import { ContractConverter } from '../src';
import { ContractOracle } from '@thecointech/contract-oracle';

const owner = await getSigner("Owner");
const converter = await ContractConverter.connect(owner);
const contract = await ContractOracle.get();

const r = await converter.setOracle(contract);
console.log(`Updated Oracle: ${r.hash}`);
await r.wait(2);
console.log("Complete")
