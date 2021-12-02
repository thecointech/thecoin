/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "../plugins/IPlugin.sol";
import "../plugins/IPluggable.sol";
import "../plugins/permissions.sol";
import "./Freezable.sol";

// TODO: Pack this tightly
struct PluginAndPermissions {
  // The amount of the users balance that we protect.
  // Equates (loosely) to cost basis
  // uint32 for cents means a max value of approx $21 million
  IPlugin plugin;

  // The last time we updated the guard amount.
  uint128 permissions;
}


abstract contract Pluggable is Freezable, IPluggable {

  // A plugin manager is allowed to assign/remove built-in plugins
  bytes32 public constant PLUGINMGR_ROLE = keccak256("PLUGINMGR_ROLE");

  // Each user may add N plugins to his account to modify
  // it's behaviour.
  mapping(address => PluginAndPermissions[]) userPlugins;


  // ------------------------------------------------------------------------
  // Plugin-specific functions.
  // ------------------------------------------------------------------------

  // Assign new plugin to user.  Currently un-guarded.  Obvs needs that guard
  function pl_assignPlugin(address user, address plugin, uint128 permissions) public onlyPluginMgr {
    IPlugin _p = IPlugin(plugin);
    _p.userAttached(user, msg.sender);

    PluginAndPermissions memory pnp;
    pnp.plugin = _p;
    pnp.permissions = permissions;
    userPlugins[user].push(pnp);
  }

  // Remove plugin from user.  As above
  function pl_removePlugin(address user, uint index) public onlyPluginMgr {
    PluginAndPermissions[] storage pnps = userPlugins[user];
    for (uint i = index; i < pnps.length-1; i++){
      pnps[i] = pnps[i+1];
    }
    delete pnps[pnps.length-1];
    pnps.pop();
  }

  // Users balance as reported by plugins
  function pl_balanceOf(address user) public view returns(uint) {
    uint balance = balanceOf(user);
    // Allow any adjustments from plugins;
    for (uint i =0; i < userPlugins[user].length; i++) {
      PluginAndPermissions memory pnp = userPlugins[user][i];
      if (pnp.permissions & PERMISSION_BALANCE != 0) {
        balance = pnp.plugin.balanceOf(user, balance);
      }
    }
    return balance;
  }

  // A special-purpose plugin transfer fn, in case we need to restrict it later(?)
  function pl_transferTo(address user, uint amount) public {
    // We assume the plugin knows what it's doing here;
    // no need to check permissions etc
    _transfer(_msgSender(), user, amount);
  }

  // Allow a plugin to transfer money out of a users account.
  // Somehow, this needs to be locked to only allow a plugin that
  // is currently being queried to access the account of the user
  // who is currently engaging to function.  This could be achieved
  // either by saving local state, or by (better) passing an argument
  // through the stack that uniquely indentifies this request.
  function pl_transferFrom(address user, address to, uint amount) public {
    // Has the user given permission to this plugin?
    PluginAndPermissions memory pnp = findPlugin(user, _msgSender());
    require(pnp.permissions & PERMISSION_WITHDRAWAL != 0, "Plugin not granted transferFrom permissions");
    _transfer(user, to, amount);
  }

  // Check if the plugin is assigned to user.
  function findPlugin(address user, address plugin) public view returns(PluginAndPermissions memory) {
    for (uint i =0; i < userPlugins[user].length; i++) {
      if (address(userPlugins[user][i].plugin) == plugin) {
        return userPlugins[user][i];
      }
    }
    revert("Cannot find plugin for address");
  }

  // ------------------------------------------------------------------------
  // Modifiers
  // ------------------------------------------------------------------------
  modifier onlyPluginMgr()
  {
    require(hasRole(PLUGINMGR_ROLE, msg.sender), "Action requires Plugin Manager role");
    _;
  }

  modifier isTransferable(address from, uint amount) {
    // This hook is called on mint/burn, make sure we skip checks then
    if (from != address(0)) {
      // include any plugin effects here.
      uint256 senderBalance = pl_balanceOf(from);
      require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
    }
    _;
  }
}
