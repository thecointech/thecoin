import { getSigner } from '@thecointech/signers';
import { connectOracle } from '../src';
import { getOverrideFees } from '@thecointech/contract-base';
import { DateTime } from 'luxon';

// ----------------------------------------------------------------
// This simple script compares the value stored in Oracle vs
// the value in the database.
const signer = await getSigner("OracleOwner");
const oracle = await connectOracle(signer);

const resetTime = DateTime.fromISO('2023-06-27T12:00:00')
console.log("Resetting Oracle to time: ")

const overrides = await getOverrideFees(oracle.runner.provider);
const tx = await oracle.resetTo(resetTime.toMillis(), overrides);
// const tx = await oracle.clearAllData(overrides);

await tx.wait(2);
console.log("Done: " + tx.hash)
// const r = await fetch("http://localhost:7001/api/v1/doUpdate")
// console.log(r)
