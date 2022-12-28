import { BigNumber } from '@ethersproject/bignumber';

// Duplicate of plugin permissions in interfaces/permissions.sol
export const PERMISSION_BALANCE = 1 << 0;
export const PERMISSION_DEPOSIT = 1 << 1;
export const PERMISSION_WITHDRAWAL = 1 << 2;
export const PERMISSION_APPROVAL = 1 << 3;
export const PERMISSION_AUTO_ACCESS = 1 << 4;
export const ALL_PERMISSIONS = BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFF").toString();
