
// Duplicate of plugin permissions in interfaces/permissions.sol
export const PERMISSION_BALANCE = BigInt(1 << 0);
export const PERMISSION_DEPOSIT = BigInt(1 << 1);
export const PERMISSION_WITHDRAWAL = BigInt(1 << 2);
export const PERMISSION_APPROVAL = BigInt(1 << 3);
export const PERMISSION_AUTO_ACCESS = BigInt(1 << 4);
// Max uint96
export const ALL_PERMISSIONS = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFF");
