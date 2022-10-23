/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "../interfaces/IPlugin.sol";
import "../interfaces/IPluggable.sol";
import "../interfaces/permissions.sol";
import "./Freezable.sol";

// TODO: Pack this tightly
struct PluginAndPermissions {
  // Plugin address (20bytes)
  IPlugin plugin;

  // The permissions the user has granted to
  // the plugin.  These permissions persist
  // even if the plugin changes to request
  // other permissions.
  uint96 permissions;
}


abstract contract Pluggable is Freezable, IPluggable, PermissionUser {

  // A plugin manager is allowed to assign/remove built-in plugins
  bytes32 public constant PLUGINMGR_ROLE = keccak256("PLUGINMGR_ROLE");

  // Each user may add N plugins to his account to modify
  // it's behaviour.
  mapping(address => PluginAndPermissions[]) userPlugins;


  // ------------------------------------------------------------------------
  // Plugin-specific functions.
  // ------------------------------------------------------------------------

  // Assign new plugin to user.  Currently un-guarded.  Obvs needs that guard
  function pl_assignPlugin(address user, address plugin, uint96 permissions, bytes memory /*signature*/) public
    onlyPluginMgr
  {
    IPlugin _p = IPlugin(plugin);
    _p.userAttached(user, msg.sender);

    PluginAndPermissions memory pnp;
    pnp.plugin = _p;
    pnp.permissions = permissions;
    userPlugins[user].push(pnp);

    emit PluginAttached(user, plugin);
  }

  // Remove plugin from user.  As above
  function pl_removePlugin(address user, uint index, bytes memory /*signature*/) public
    onlyPluginMgr
  {
    PluginAndPermissions[] storage pnps = userPlugins[user];
    pnps[index].plugin.userDetached(user, msg.sender);
    for (uint i = index; i < pnps.length-1; i++){
      pnps[i] = pnps[i+1];
    }
    delete pnps[pnps.length-1];
    pnps.pop();

    emit PluginDetached(user, address(this));
  }

  // Users balance as reported by plugins
  // This is distinct from the standard balance
  // in that it may go negative (via UberConverter)
  function pl_balanceOf(address user) public view returns(int) {
    int balance = int(balanceOf(user));
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
  // Notification. Override
  // ------------------------------------------------------------------------

  // We cannot use the _beforeTokenTransfer hook because it does
  // not include the timestamp information.  Therefore we override
  // all transfer functions and put our hooks in beside them
  function exactTransfer(address to, uint amount, uint256 timestamp) public override {
    super.exactTransfer(to, amount, timestamp);
    notifyDeposit(to, amount, timestamp);
  }
  function certifiedTransfer(address from, address to, uint256 amount, uint256 fee, uint256 timestamp, bytes memory signature) public override {
    super.certifiedTransfer(from, to, amount, fee, timestamp, signature);
    notifyWithdraw(from, amount, timestamp);
    notifyDeposit(to, amount, timestamp);
  }
  function transfer(address to, uint amount) public override(ERC20Upgradeable, IERC20Upgradeable) returns (bool) {
    notifyWithdraw(msg.sender, amount, block.timestamp);
    super.transfer(to, amount);
    notifyDeposit(to, amount, block.timestamp);
    return true;
  }

  function notifyDeposit(address to, uint256 amount, uint256 timestamp) private {
    for (uint i =0; i < userPlugins[to].length; i++) {
      userPlugins[to][i].plugin.preDeposit(to, amount, timestamp);
    }
  }
  function notifyWithdraw(address from, uint256 amount, uint256 timestamp) private {
    uint balance = balanceOf(from);
    for (uint i =0; i < userPlugins[from].length; i++) {
      balance = userPlugins[from][i].plugin.preWithdraw(from, balance, amount, timestamp);
    }
  }

  //-------------------------------------------------------------------------
  // UberTransfer: A full-fledged (probably quite expensive) transfer that
  // provides more info.  This allows far more powerful plugins.
  //-------------------------------------------------------------------------
  function uberTransfer(
    address from,
    address to,             //
    uint amount,         // Amount of currency in atomic unit (eg, cents)
    uint16 currency,          // CurrencyCode.  0 for TheCoin, 124 for CAD
    //uint256 fee,            // The fee paid to whowever is submitting this
    uint transferTime,   // When the transfer is to take place
    uint signedTime,        // When the transfer was signed (for timestampIncreases)
    bytes memory signature
  ) public timestampIncreases(from, signedTime)
  {
    address signer = recoverUberSigner(from, to, amount, currency, transferTime, signedTime, signature);
    require(signer == from, "Signer does not match from address");

    (uint finalAmount, uint16 finalCurrency) = (amount, currency);
    for (uint i =0; i < userPlugins[from].length; i++) {
      (finalAmount, finalCurrency) = userPlugins[from][i].plugin.modifyTransfer(from, to, finalAmount, finalCurrency, transferTime);
    }
    // We have completed, and are ready to
    lastTxTimestamp[from] = signedTime;

    // If the plugins have already handled this transaction, let it be.
    if (finalAmount == 0) return;

    // Is the amount to be transferred in Coin?
    require(finalCurrency == 0, "Cannot transfer non-Coin currencies directly");

    // Seems good - do the transfer
    _transfer(from, to, finalAmount);
    //_transfer(from, msg.sender, fee);

      emit ExactTransfer(from, to, finalAmount, transferTime);
  }

	function buildUberMessage(address from, address to, uint256 amount, uint16 currency, uint transferTime, uint signedTime) public pure returns (bytes32)
	{
		bytes memory packed = abi.encodePacked(from, to, amount, currency, transferTime, signedTime);
		return keccak256(packed);
	}

 	function recoverUberSigner(address from, address to, uint256 amount, uint16 currency, uint transferTime, uint signedTime, bytes memory signature) public pure returns (address)
	{
		// This recreates the message that was signed on the client.
    bytes32 message = buildUberMessage(from, to, amount, currency, transferTime, signedTime);
		bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(message);
		return ECDSAUpgradeable.recover(signedMessage, signature);
	}

  // ------------------------------------------------------------------------
  // Modifiers
  // ------------------------------------------------------------------------
  modifier onlyPluginMgr()
  {
    require(hasRole(PLUGINMGR_ROLE, msg.sender), "Action requires Plugin Manager role");
    _;
  }
}
