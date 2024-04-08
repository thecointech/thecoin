import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { connectOracle } from '../src';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import hre from 'hardhat';

// Oracle originally used a live wallet as both updater & owner
// Split owner privleges into cold wallet.

const updater = await getDeploySigner("OracleUpdater")
const newOwner = await getSigner("OracleOwner");
const existing = await connectOracle(updater);
const newOwnerAddress = await newOwner.getAddress();

const updaterRole = await existing.UPDATER_ROLE();

// Assign to new owner
// const r = await hre.upgrades.admin.transferProxyAdminOwnership(newOwnerAddress, updater);
// console.log(r);
// await existing.grantRole(adminRole, newOwnerAddress);
// await existing.transferOwnership(newOwnerAddress);

// Ensure still updater
const underNewOwner = await connectOracle(newOwner);
const hasRole = await existing.hasRole(updaterRole, updater.getAddress());
if (!hasRole) {
  await underNewOwner.grantRole(updaterRole, updater.getAddress());
}

// remove Admin - NOTE: UPDATER_ROLE == ADMIN
// const isAdmin = await underNewOwner.hasRole(adminRole, updater.getAddress());
// if (isAdmin) {
//   await underNewOwner.revokeRole(adminRole, updater.getAddress());
// }

// Check admin
const owner = await underNewOwner.owner();
log.info(`Owner: ${owner}`);

// Assign owner as new owner
