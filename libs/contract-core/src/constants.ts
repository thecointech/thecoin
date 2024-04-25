import { keccak256 } from 'ethers';
export { COIN_EXP } from '@thecointech/contract-base';

// Duplicate of roles defined in solidity files.
const roleId = (id: string) => keccak256(['string'], [id]);
export const THECOIN_ROLE   = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MINTER_ROLE    = roleId("MINTER_ROLE");
export const BROKER_ROLE    = roleId("BROKER_ROLE");
export const MRFREEZE_ROLE  = roleId("MRFREEZE_ROLE");
export const PLUGINMGR_ROLE = roleId("PLUGINMGR_ROLE");
