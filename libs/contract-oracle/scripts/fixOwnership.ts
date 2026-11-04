import { ContractOracle } from '../src';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import hre from 'hardhat';

// Oracle originally used a live wallet as both updater & owner
// Split owner privileges into cold wallet.
//
// Must be run AFTER upgrading the impl to the version where
// UPDATER_ROLE is distinct from DEFAULT_ADMIN_ROLE, as the
// current admin (OracleUpdater) must sign the role changes.

const updater = await getSigner("OracleUpdater");
const newOwner = await getSigner("OracleOwner");
const existing = await ContractOracle.connect(updater);
const updaterAddress = await updater.getAddress();
const newOwnerAddress = await newOwner.getAddress();

console.log("Updater address: ", updaterAddress);
console.log("New owner address: ", newOwnerAddress);

const updaterRole = await existing.UPDATER_ROLE();
const adminRole = await existing.DEFAULT_ADMIN_ROLE();

if ((await existing.hasRole(adminRole, newOwnerAddress))) {
  console.log("New Owner already has DEFAULT_ADMIN_ROLE");
}
if ((await existing.hasRole(updaterRole, updaterAddress))) {
  console.log("OracleUpdater already has UPDATER_ROLE");
}

// 1. Ensure the hot wallet keeps (only) update rights
if (!await existing.hasRole(updaterRole, updaterAddress)) {
  log.info("Granting UPDATER_ROLE to OracleUpdater");
  await (await existing.grantRole(updaterRole, updaterAddress)).wait();
}
else {
  log.info("UPDATER_ROLE already granted to OracleUpdater");
}

// 2. Grant admin to the cold wallet BEFORE revoking (else lockout)
if (!await existing.hasRole(adminRole, newOwnerAddress)) {
  log.info("Granting DEFAULT_ADMIN_ROLE to OracleOwner");
  await (await existing.grantRole(adminRole, newOwnerAddress)).wait();
}
else {
  log.info("DEFAULT_ADMIN_ROLE already granted to OracleOwner");
}

// 3. Remove admin rights from the hot key
if (await existing.hasRole(adminRole, updaterAddress)) {
  log.info("Revoking DEFAULT_ADMIN_ROLE from OracleUpdater");
  await (await existing.revokeRole(adminRole, updaterAddress)).wait();
}
else {
  log.info("DEFAULT_ADMIN_ROLE already revoked from OracleUpdater");
}

// 4. Move contract-upgrade rights to the cold wallet
// (currently held by OracleUpdater, so it must sign the transfer)
log.info("Transferring ProxyAdmin ownership to OracleOwner");
const proxyAddress = await existing.getAddress();
await hre.upgrades.admin.transferProxyAdminOwnership(proxyAddress, newOwnerAddress, updater);

// 5. Move onlyOwner rights (resetTo/clearAllData)
log.info("Transferring contract ownership to OracleOwner");
await (await existing.transferOwnership(newOwnerAddress)).wait();

log.info({
  owner: await existing.owner(),
  updaterHasUpdaterRole: await existing.hasRole(updaterRole, updaterAddress),
  ownerHasAdminRole: await existing.hasRole(adminRole, newOwnerAddress),
  updaterHasAdminRole: await existing.hasRole(adminRole, updaterAddress),
}, "Ownership fix complete");
