/**
 * A plugin interface that can be added to a users account
 * Plugins are contracts that can modify user transactions
 * on the fly.
*/

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IPlugin is IERC165 {

  // An interface has a list of permissions that it must request

  // Get the permissions requested by this plugin over users account.
  // A user must sign these permissions and store with their account on TC.
  function getPermissions() external view returns(uint);

  // Hook called whenever a user adds a plugin to their account.
  function userAttached(address add, uint timeMs, address initiator) external;

  // Hook called whenever a user removes a plugin from their account
  function userDetached(address remove, address initiator) external;

  // A plugin may modify the users reported balance.
  // Requires PERMISSION_BALANCE
  function balanceOf(address user, int currentBalance) external view returns(int);

  // A plugin may take actions in response to user transfer.  Eg - it may
  // automatically top up the account, restrict the transfer, or perform
  // some other kind of action.
  // requires PERMISSION_DEPOSIT/PERMISSION_WITHDRAWAL/PERMISSION_APPROVAL
  function preDeposit(address user, uint balance, uint coin, uint msTime) external;
  function preWithdraw(address user, uint balance, uint coin, uint msTime) external returns(uint);

  function modifyTransfer(address from, address to, uint amount, uint16 currency, uint msTransferAt, uint msSignedAt) external returns (uint, uint16);
}
