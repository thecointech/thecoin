import { keccak256 } from '@ethersproject/solidity';

//
// Multiplier of base values to human-readable fractions (eg $ and c)
export const COIN_EXP = 1000000;

// Duplicate of roles defined in solidity files.
const roleId = (id: string) => keccak256(['string'], [id]);
export const THECOIN_ROLE   = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MINTER_ROLE    = roleId("MINTER_ROLE");
export const BROKER_ROLE    = roleId("BROKER_ROLE");
export const MRFREEZE_ROLE  = roleId("MRFREEZE_ROLE");
export const PLUGINMGR_ROLE = roleId("PLUGINMGR_ROLE");
