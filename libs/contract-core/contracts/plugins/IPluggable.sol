/**
 * A plugin interface that can be added to a users account
 * Plugins are contracts that can modify user transactions
 * on the fly.
*/

// SPDX-License-Identifier: GPL-3.0-or-later

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

pragma solidity ^0.8.0;

/// @title Interface to allow plugins to interop with base contract
/// @author TheCoin
/// @dev Plugin-specific versions allow plugins to do stuff ordinary users can't do.
interface IPluggable is IERC20Upgradeable {

  // Assign new plugin to user.  Currently un-guarded.  Obvs needs that guard
  function pl_assignPlugin(address user, address plugin, uint128 permissions) external;

  // Remove plugin from user.  As above
  function pl_removePlugin(address user, uint index) external;

  // Users balance as reported by plugins
  function pl_balanceOf(address user) external view returns(uint);

  // A special-purpose plugin transfer fn, in case we need to restrict it later(?)
  function pl_transferTo(address user, uint amount) external;

  // Allow a plugin to transfer money out of a users account.
  // Somehow, this needs to be locked to only allow a plugin that
  // is currently being queried to access the account of the user
  // who is currently engaging to function.  This could be achieved
  // either by saving local state, or by (better) passing an argument
  // through the stack that uniquely indentifies this request.
  function pl_transferFrom(address user, address to, uint amount) external;
}
