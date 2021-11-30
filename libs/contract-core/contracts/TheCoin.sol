/// @title TheCoin: Future-proof currency
/// @author Stephen Taylor
/// @notice TheCoin is a stablecoin, backed by the S&P500 and designed as a day-to-day currency.
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "./plugins/IPlugin.sol";
import "./plugins/permissions.sol";


// TODO: Pack this tightly
struct PluginAndPermissions {
  // The amount of the users balance that we protect.
  // Equates (loosely) to cost basis
  // uint32 for cents means a max value of approx $21 million
  IPlugin plugin;

  // The last time we updated the guard amount.
  uint128 permissions;
}


// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals
//
// NOTE: 100 these is equivalent to 1 share of SPX,
// or *at time of writing* roughly $2.70 USD
// and with 6 decimal places 100,000,000 tokens is 1 share,
// and 1 token has an approximate value of 0.00027c USD
// ----------------------------------------------------------------------------
contract TheCoin is ERC20Upgradeable, AccessControlEnumerableUpgradeable {

  // An account may be subject to a timeout, during which
  // period it is forbidden from transferring its value
  mapping(address => uint) freezeUntil;

  // Each user may add N plugins to his account to modify
  // it's behaviour.
  mapping(address => PluginAndPermissions[]) userPlugins;

  // A stored list of timestamps that are used to uniquely
  // specify transactions running through paidTransaction.
  // Each tx comes with a timestamp that must be higher than
  // the last tx timestamp, and (more or less) be in the
  // same time as the block being mined.  This ensures
  // tx authentications are unique, and expire
  // relatively shortly after issue
  mapping(address => uint) lastTxTimestamp;

  // The following addresses have different roles

  // The Minter is permitted to mint/melt coins.
  // All coins minted/melted by the minter are
  // from/to  address
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // THE Coin reserve address.  This is the address
  // directly managed by the THE Coin Inc.  Brokers
  // interact with this address when purchase/redeem coins
  bytes32 public constant THECOIN_ROLE = DEFAULT_ADMIN_ROLE;

  // The Police have very limited powers, they may
  // freeze accounts but nothing else
  bytes32 public constant MRFREEZE_ROLE = keccak256("MRFREEZE_ROLE");

  // We register brokers(?)
  bytes32 public constant BROKER_ROLE = keccak256("BROKER_ROLE");

  // ------------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------------

  // We record the exact timestamp a transaction was initiated
  // to ensure our tracking is precise (for tax etc).
  // NOTE: timestamp here is in millis (not seconds)
  event ExactTransfer(address indexed from, address indexed to, uint amount, uint timestamp);

  // ------------------------------------------------------------------------
  // Constructor
  // ------------------------------------------------------------------------
  function initialize(address sender) public initializer
  {
    __ERC20_init("TheCoin", "THE");
    __AccessControl_init();

    // We only setup the default role here
    _setupRole(THECOIN_ROLE, sender);
  }

// Clone function is used on initialization to define
  function runCloneTransfer(address from, address to, uint amount, uint fee, uint timestamp) public onlyRole(DEFAULT_ADMIN_ROLE) {
      // Simple check to ensure this only occurs on new accounts
      // This function should be removed once the system is active
      require(lastTxTimestamp[from] == 0, "Cannot clone transfer on active account");
      _transfer(from, to, amount);
      if (fee > 0) {
        _transfer(from, msg.sender, fee);
      }
      emit ExactTransfer(from, to, amount, timestamp);
  }

  function decimals() public view virtual override returns (uint8) {
    return 6;
  }

  // ------------------------------------------------------------------------
  // Total supply management
  // ------------------------------------------------------------------------

  // The owner will periodically add new coins to match
  // shares purchased in SPX
  function mintCoins(uint amount, address to, uint timestamp) public
    onlyMinter
  {
    // We can only mint coins to the TC address
    _checkRole(THECOIN_ROLE, to);
    _mint(to, amount);
    emit ExactTransfer(address(0), to, amount, timestamp);
  }

  // Remove coins.  Only TheCoin may burn coins
  function burnCoins(uint amount, uint timestamp) public
    onlyTheCoin
  {
    _burn(_msgSender(), amount);
    emit ExactTransfer(_msgSender(), address(0), amount, timestamp);
  }

  // Coins currently owned by end-users
  function coinsCirculating() public view returns(uint)
  {
      return totalSupply() - reservedCoins();
  }

  // Coins held by TC in reserve.  This includes both
  // root TC account and brokers.
  function reservedCoins() public view returns (uint reserved)
  {
    for (uint i = 0; i < getRoleMemberCount(MINTER_ROLE); i++) {
      reserved += balanceOf(getRoleMember(THECOIN_ROLE, i));
    }
    for (uint i = 0; i < getRoleMemberCount(BROKER_ROLE); i++) {
      reserved += balanceOf(getRoleMember(BROKER_ROLE, i));
    }
    reserved;
  }

  // ------------------------------------------------------------------------
  // Additional paid-transfer functions allows a client to sign a request
  // and for the request to be paid by someone else (likely us)
  // Apparently this is now a thing (gass-less transactions), but our
  // implementation appears significantly more efficient.
  // ------------------------------------------------------------------------
  function certifiedTransfer(address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature) public
    timestampIncreases(from, timestamp)
    isTransferable(from, value + fee)
  {
      address signer = recoverSigner(from, to, value, fee, timestamp, signature);
      require(signer == from, "Invalid signature for address");
      _transfer(from, to, value);
      _transfer(from, msg.sender, fee);

      emit ExactTransfer(from, to, value, timestamp);
      lastTxTimestamp[from] = timestamp;
  }

	function buildMessage(address from, address to, uint256 value, uint256 fee, uint256 timestamp)
	public pure returns (bytes32)
	{
		bytes memory packed = abi.encodePacked(from, to, value, fee, timestamp);
		return keccak256(packed);
	}

	function recoverSigner(address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature)
	public pure returns (address)
	{
		// This recreates the message that was signed on the client.
    bytes32 message = buildMessage(from, to, value, fee, timestamp);
		bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(message);
		return ECDSAUpgradeable.recover(signedMessage, signature);
	}

  // ------------------------------------------------------------------------
  // Client interactions with TheCoin
  // ------------------------------------------------------------------------

  // Allow specifying exact timestamp.  This is to allow specifying the timestamp for purchase/sale
  function exactTransfer(address to, uint amount, uint256 timestamp) public onlyTheCoin {
    _transfer(_msgSender(), to, amount);
    emit ExactTransfer(_msgSender(), to, amount, timestamp);
  }

  // ------------------------------------------------------------------------
  // Plugin-specific functions.
  // ------------------------------------------------------------------------

  // Assign new plugin to user.  Currently un-guarded.  Obvs needs that guard
  function pl_assignPlugin(address user, address plugin, uint128 permissions) public onlyTheCoin {
    IPlugin _p = IPlugin(plugin);
    _p.userAttached(user, _msgSender());

    PluginAndPermissions memory pnp;
    pnp.plugin = _p;
    pnp.permissions = permissions;
    userPlugins[user].push(pnp);
  }

  // Remove plugin from user.  As above
  function pl_removePlugin(address user, uint index) public onlyTheCoin {
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
  // Sets a timeout, until which time the user will not
  // account may not be transacted against.
  // ------------------------------------------------------------------------
  function setAccountFreezeTime(address account, uint time) public
    onlyMrFreeze
  {
      freezeUntil[account] = time;
  }

  // ------------------------------------------------------------------------
  // Returns the timestamp of when this account will
  // be unfrozen (able to be transacted against)
  // ------------------------------------------------------------------------
  function accountUnfreezeTime(address account) public
  view
  returns(uint)
  {
      return freezeUntil[account];
  }

  // ------------------------------------------------------------------------
  // Don't accept ETH
  // ------------------------------------------------------------------------
  fallback () external {
      revert("This contract does not run on Ether");
  }

  // ------------------------------------------------------------------------
  // Owner can transfer out any ERC20 tokens accidentally assigned to this contracts address
  // ------------------------------------------------------------------------
  function transferAnyERC20Token(address tokenAddress, uint256 tokens) public onlyTheCoin returns (bool success) {
      IERC20Upgradeable tokenContract = IERC20Upgradeable(tokenAddress);
      address theCoin = getRoleMember(THECOIN_ROLE, 0);
      require(theCoin != address(0), "Cannot transfer out without TC address");
      return tokenContract.transfer(theCoin, tokens);
  }

  // ------------------------------------------------------------------------
  // Override hooks to ensure isTransferable is called for every transfer
  // ------------------------------------------------------------------------
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override
    isTransferable(from, amount)
  {
    super._beforeTokenTransfer(from, to, amount);
  }

  ///////////////////////////////
  modifier isTransferable(address from, uint amount) {
    // This hook is called on mint/burn, make sure we skip checks then
    if (from != address(0)) {
      require(freezeUntil[from] < block.timestamp, "Caller's account is currently frozen");

      // include any plugin effects here.
      uint256 senderBalance = pl_balanceOf(from);
      require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
    }
    _;
  }

  modifier onlyMinter()
  {
    require(hasRole(MINTER_ROLE, _msgSender()), "Action requires Minter role");
    _;
  }

  modifier onlyTheCoin()
  {
    require(hasRole(THECOIN_ROLE, _msgSender()), "Action requires TheCoin role");
    _;
  }

  modifier onlyMrFreeze()
  {
    require(hasRole(MRFREEZE_ROLE, _msgSender()), "Action requires MrFreeze role");
    _;
  }

  modifier timestampIncreases(address from, uint256 timestamp)
  {
    require(timestamp > lastTxTimestamp[from], "Provided timestamp is lower than recorded timestamp");
    _;
  }
}
