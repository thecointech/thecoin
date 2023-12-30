/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import '@thecointech/contract-plugins/contracts/IPlugin.sol';
import '@thecointech/contract-plugins/contracts/IPluggable.sol';
import '@thecointech/contract-plugins/contracts/permissions.sol';
import "./Freezable.sol";

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
  function pl_assignPlugin(AssignRequest calldata request) public
    onlyPluginMgr
    timestampIncreases(request.user, request.msSignedAt)
  {
    bytes32 hashed = keccak256(
      abi.encodePacked(request.chainId, request.plugin, request.timeMs, request.permissions, request.msSignedAt)
    );
		bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(hashed);
    address signer = ECDSAUpgradeable.recover(signedMessage, request.signature);
//    address signer = getAssignSigner(chainId, plugin, timeMs, permissions, msSignedAt, signature);
    require(signer == request.user, "Invalid signature for address");

    IPlugin _p = IPlugin(request.plugin);
    _p.userAttached(request.user, request.timeMs, msg.sender);

    PluginAndPermissions memory pnp;
    pnp.plugin = _p;
    pnp.permissions = request.permissions;
    userPlugins[request.user].push(pnp);

    emit PluginAttached(request.user, request.plugin);

    lastTxTimestamp[request.user] = request.msSignedAt;
  }

  // function getAssignSigner(uint chainId, address plugin, uint timeMs, uint96 permissions, uint msSignedAt, bytes memory signature) internal pure returns (address) {
  //   bytes memory packed = abi.encodePacked(chainId, plugin, timeMs, permissions, msSignedAt);
  //   bytes32 hashed = keccak256(packed);
	// 	bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(hashed);
  //   return ECDSAUpgradeable.recover(signedMessage, signature);
  // }

  // Remove plugin from user.  As above
  function pl_removePlugin(RemoveRequest calldata request) public
    onlyPluginMgr
    timestampIncreases(request.user, request.msSignedAt)
  {
    bytes32 hashed = keccak256(
      abi.encodePacked(request.chainId, request.index, request.msSignedAt)
    );
		bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(hashed);
		address signer = ECDSAUpgradeable.recover(signedMessage, request.signature);
    require(signer == request.user, "Invalid signature for address");

    PluginAndPermissions[] storage pnps = userPlugins[request.user];
    pnps[request.index].plugin.userDetached(request.user, msg.sender);
    for (uint i = request.index; i < pnps.length-1; i++){
      pnps[i] = pnps[i+1];
    }
    delete pnps[pnps.length-1];
    pnps.pop();

    emit PluginDetached(request.user, address(this));
    lastTxTimestamp[request.user] = request.msSignedAt;
  }


  // function buildPluginModMessage(uint chainId, address from, address to, uint256 amount, uint16 currency, uint msTransferAt, uint msSignedAt) public pure returns (bytes32)
	// {
	// 	bytes memory packed = abi.encodePacked(chainId, from, to, amount, currency, msTransferAt, msSignedAt);
	// 	return keccak256(packed);
	// }

 	// function recoverPluginModSigner(uint chainId, address plugin, uint timeMs, uint96 permissions, uint signedTime, bytes memory signature) public pure returns (address)
	// {
	// 	// This recreates the message that was signed on the client.
  //   bytes32 message = buildPluginModMessage(chainId, plugin, timeMs, permissions, signedTime);
	// 	bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(message);
	// 	return ECDSAUpgradeable.recover(signedMessage, signature);
	// }

  // Users balance as reported by plugins
  // This is distinct from the standard balance
  // in that it may go negative (via UberConverter)
  function pl_balanceOf(address user) public view returns(int) {
    int balance = int(balanceOf(user));
    // Allow any adjustments from plugins;
    for (uint i =0; i < userPlugins[user].length; i++) {
      PluginAndPermissions memory pnp = userPlugins[user][i];
      if (pnp.permissions & PERMISSION_BALANCE != 0) {
        // If there is a plugin calling this, stop before it affects the balance
        if (address(userPlugins[user][i].plugin) == _msgSender()) {
          break;
        }
        balance = pnp.plugin.balanceOf(user, balance);
      }
    }
    return balance;
  }

  // A special-purpose plugin transfer fn, in case we need to restrict it later(?)
  function pl_transferTo(address user, uint amount, uint timeMillis) public {

    // We assume the plugin knows what it's doing here;
    // no need to check permissions etc
    // (NOTE: to consider: if this does an exact transfer,
    // we probably should lock it down a little)

    // Question: do we notify other plugins about this transfer?
    // Yes, because the ShockAbsorber needs to know if/when
    // the UberConverter completes it's transfers (and if
    // withdrawal is notified, then deposits need to be as well)
    // notifyDeposit clone
    uint balance = balanceOf(user);
    for (uint i =0; i < userPlugins[user].length; i++) {
      // skip the calling plugin though
      if (address(userPlugins[user][i].plugin) == _msgSender()) {
        continue;
      }
      userPlugins[user][i].plugin.preDeposit(user, balance, amount, timeMillis);
    }

    _transfer(_msgSender(), user, amount);

    emit ExactTransfer(_msgSender(), user, amount, timeMillis);

  }

  // Allow a plugin to transfer money out of a users account.
  // UberConverter uses this to delay transfers
  function pl_transferFrom(address user, address to, uint amount, uint256 timeMillis) virtual public {
    // Has the user given permission to this plugin?
    PluginAndPermissions memory pnp = findPlugin(user, _msgSender());
    require(pnp.permissions & PERMISSION_WITHDRAWAL != 0, "Plugin not granted transferFrom permissions");

    // notifyWithdrawal clone
    uint balance = balanceOf(user);
    for (uint i =0; i < userPlugins[user].length; i++) {
      // skip the calling plugin though
      if (address(userPlugins[user][i].plugin) == _msgSender()) {
        continue;
      }
      balance = userPlugins[user][i].plugin.preWithdraw(user, balance, amount, timeMillis);
    }

    _transfer(user, to, amount);
    emit ExactTransfer(user, to, amount, timeMillis);
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

  function getUsersPlugins(address user) public view returns(PluginAndPermissions[] memory) {
    return userPlugins[user];
  }

  // ------------------------------------------------------------------------
  // Notification. Override
  // ------------------------------------------------------------------------
  function msNow() public view returns(uint) { return block.timestamp * 1000; }

  // We cannot use the _beforeTokenTransfer hook because it does
  // not include the timestamp information.  Therefore we override
  // all transfer functions and put our hooks in beside them
  function exactTransfer(address to, uint amount, uint256 timestamp) public override {
    notifyWithdraw(_msgSender(), amount, timestamp);
    notifyDeposit(to, amount, timestamp);
    super.exactTransfer(to, amount, timestamp);
  }
  function certifiedTransfer(uint chainId, address from, address to, uint256 amount, uint256 fee, uint256 timestamp, bytes memory signature) public override {
    notifyWithdraw(from, amount, timestamp);
    notifyDeposit(to, amount, timestamp);
    super.certifiedTransfer(chainId, from, to, amount, fee, timestamp, signature);
  }
  function transfer(address to, uint amount) public override(ERC20Upgradeable, IERC20Upgradeable) returns (bool) {
    notifyWithdraw(_msgSender(), amount, msNow());
    notifyDeposit(to, amount, msNow());
    super.transfer(to, amount);
    return true;
  }

  function notifyDeposit(address to, uint256 amount, uint256 timestamp) private {
    uint balance = balanceOf(to);
    for (uint i =0; i < userPlugins[to].length; i++) {
      userPlugins[to][i].plugin.preDeposit(to, balance, amount, timestamp);
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
    uint chainId, // No cross-chain cheating
    address from,
    address to,               //
    uint amount,              // Amount of currency in atomic unit (eg, cents)
    uint16 currency,          // CurrencyCode.  0 for TheCoin, 124 for CAD
    //uint256 fee,            // The fee paid to whowever is submitting this
    uint msTransferAt,        // When the transfer is to take place in milliseconds
    uint msSignedAt,          // When the transfer was signed (for timestampIncreases)
    bytes memory signature
  ) public timestampIncreases(from, msSignedAt)
  {
    require(chainId == block.chainid, "Invalid chainId");
    // basic sanity
    require(msSignedAt < msNow());

    address signer = recoverUberSigner(chainId, from, to, amount, currency, msTransferAt, msSignedAt, signature);
    require(signer == from, "Signer does not match from address");

    (uint finalAmount, uint16 finalCurrency) = (amount, currency);
    for (uint i =0; i < userPlugins[from].length; i++) {
      (finalAmount, finalCurrency) = userPlugins[from][i].plugin.modifyTransfer(from, to, finalAmount, finalCurrency, msTransferAt, msSignedAt);
    }
    // We have completed, and are ready to
    lastTxTimestamp[from] = msSignedAt;

    // If the plugins have already handled this transaction, let it be.
    if (finalAmount == 0) return;

    // Is the amount to be transferred in Coin?
    require(finalCurrency == 0, "Cannot transfer non-Coin currencies directly");

    // Seems good - do the transfer
    _transfer(from, to, finalAmount);
    //_transfer(from, msg.sender, fee);

    emit ExactTransfer(from, to, finalAmount, msTransferAt);
  }

	function buildUberMessage(uint chainId, address from, address to, uint256 amount, uint16 currency, uint msTransferAt, uint msSignedAt) public pure returns (bytes32)
	{
		bytes memory packed = abi.encodePacked(chainId, from, to, amount, currency, msTransferAt, msSignedAt);
		return keccak256(packed);
	}

 	function recoverUberSigner(uint chainId, address from, address to, uint256 amount, uint16 currency, uint msTransferAt, uint msSignedAt, bytes memory signature) public pure returns (address)
	{
		// This recreates the message that was signed on the client.
    bytes32 message = buildUberMessage(chainId, from, to, amount, currency, msTransferAt, msSignedAt);
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
