import { keccak256 } from '@ethersproject/solidity';
import { BigNumber } from '@ethersproject/bignumber';

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

// Duplicate of plugin permissions in interfaces/permissions.sol
export const PERMISSION_BALANCE = 1 << 0;
export const PERMISSION_DEPOSIT = 1 << 1;
export const PERMISSION_WITHDRAWAL = 1 << 2;
export const PERMISSION_APPROVAL = 1 << 3;
export const PERMISSION_AUTO_ACCESS = 1 << 4;
export const ALL_PERMISSIONS = BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFF").toString();
