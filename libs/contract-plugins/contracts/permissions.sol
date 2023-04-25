/**
 * List bit-wise user permissions
*/

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

contract PermissionUser {
  // A contract may modify the users reported balance.  This does
  // not modify the actual amount, but may be useful for contracts
  // that (for example) encourage saving by hiding the users profit.
  // If a plugin increases the user balance, it is the responsibility
  // of the plugin to ensure that transactions over the real balance
  // succeed by transferring to the user in the pre-transfer hook
  uint constant PERMISSION_BALANCE = 1 << 0;

  // A plugin may take actions during a deposit.
  // Use case: reserving a portion of the deposit for saving, unlocking rewards etc
  uint constant PERMISSION_DEPOSIT = 1 << 1;

  // A plugin may take actions during a withdrawal.  This has similar
  // Use case: similar to deposit permission (is it redundant?)
  uint constant PERMISSION_WITHDRAWAL = 1 << 2;

  // A plugin may be used to automatically approve/decline transactions.
  // Use case: set spending limits, external lock on accounts, etc.
  // Permissions can only be applied to withdrawals, there is no
  // system in place to prevent deposits.
  uint constant PERMISSION_APPROVAL = 1 << 3;

  // An auto-access plugin may make un-attended transfers on the users
  // account once per calendar year.  This plugin will have full access
  // to the users account.
  // Use case: Inheritance/fail-over accounts (setup a backup account that can pull
  // your funds in case of lost access to account)
  uint constant PERMISSION_AUTO_ACCESS = 1 << 4;
}




// PACKED DATA
// Proposal: Bits 16 - 32 are used to define which day of the year (UTC-only) the
// plugin is allowed to interact with the users account.
// Use case: Time-Limiting may reduce the risk of an auto-access plugin doing a rug-pull.
// For example, a popular inheritance plugin is upgradeable and is modified
// to transfer to the owner instead of designated account.  If the user
// has only granted permission on 1 day of the year, we mitigate potential
// damages to 1/365 of worst case.

// Propsal: bits 32 - 64 represent maximum transfer value for plugin in TC * 1000.
// If set to 0, maximum transfer is unlimited.  Max limit ~$250
// Use case: Limit on plugins decreases risk.


