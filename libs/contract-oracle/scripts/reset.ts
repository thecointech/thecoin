import { getSigner } from '@thecointech/signers';
import { connectOracle, getContract } from '../src';
import { GetRatesApi } from '@thecointech/apis/pricing';
import { getOverrideFees } from '@thecointech/contract-tools/deploySigner';
import fetch from 'node-fetch';

// ----------------------------------------------------------------
// This simple script compares the value stored in Oracle vs
// the value in the database.
const signer = await getSigner("OracleUpdater");
const oracle = await connectOracle(signer);

const overrides = await getOverrideFees(oracle.provider);
const tx = await oracle.clearAllData(overrides);

await tx.wait(2);

const r = await fetch("http://localhost:7001/api/v1/doUpdate")

console.log(r)
