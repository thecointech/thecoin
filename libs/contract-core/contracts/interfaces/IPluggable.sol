/**
 * A plugin interface that can be added to a users account
 * Plugins are contracts that can modify user transactions
 * on the fly.
*/

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

/// @title Interface to allow plugins to interop with base contract
/// @author TheCoin
/// @dev Plugin-specific versions allow plugins to do stuff ordinary users can't do.
interface IPluggable {

  event PluginAttached(address add, address plugin);
  event PluginDetached(address add, address plugin);

  // Assign new plugin to user.  Currently un-guarded.
  // Signature is of [user, plugin, permissions, lastTxTimestamp]
  function pl_assignPlugin(address user, address plugin, uint96 permissions, bytes memory signature) external;

  // Remove plugin from user.  As above
  // Signature is of [user, plugin, lastTxTimestamp]
  function pl_removePlugin(address user, uint index, bytes memory signature) external;

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
