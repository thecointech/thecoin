import { Contract } from 'ethers';
import { ContractOracle } from '../src';
import { log } from '@thecointech/logging';
import { exit } from 'process';
import { getAdminAddress, getImplementationAddress } from '@openzeppelin/upgrades-core';
import { getProvider } from '@thecointech/ethers-provider';
import { getSigner } from '@thecointech/signers';

// Verify the oracle's ProxyAdmin is owned by OracleOwner (not OracleUpdater).
// The updater key is "hot" (used by the rates-service every 3hrs), so it
// must not have the power to upgrade the contract.
// Run: CONFIG_NAME=prodtest|prod yarn _hardhat ./tools/checkAdmin.ts

const contract = await ContractOracle.get();
const provider = await getProvider();
const proxyAddress = await contract.getAddress();

const adminAddress = await getAdminAddress(provider as any, proxyAddress);
const implAddress = await getImplementationAddress(provider as any, proxyAddress);

if (adminAddress === '0x0000000000000000000000000000000000000000') {
  log.error({ proxyAddress, implAddress }, "No ProxyAdmin found - is this a transparent proxy?");
  exit(1);
}

const admin = new Contract(
  adminAddress,
  ['function owner() view returns (address)'],
  provider,
);
const adminOwner: string = await admin.owner();

// Who should own it?  Prefer the wallet env var, fall back to the signer.
const expected = (
  process.env.WALLET_OracleOwner_ADDRESS
  ?? await (await getSigner("OracleOwner")).getAddress()
).toLowerCase();

const updater = process.env.WALLET_OracleUpdater_ADDRESS;

log.info({
  proxyAddress,
  implAddress,
  adminAddress,
  adminOwner,
  expectedOwner: expected,
}, "Oracle proxy admin state");

if (updater && adminOwner.toLowerCase() === updater.toLowerCase()) {
  log.error("ProxyAdmin is owned by OracleUpdater - the hot updater key can upgrade the contract!");
  exit(1);
}
if (adminOwner.toLowerCase() !== expected) {
  log.error({ adminOwner, expected }, "ProxyAdmin owner does not match OracleOwner");
  exit(1);
}
log.info("ProxyAdmin ownership is correct");
