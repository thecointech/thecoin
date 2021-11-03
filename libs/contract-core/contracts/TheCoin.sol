/// @title THE:Coin: Future-proof currency
/// @author Stephen Taylor
/// @notice TheCoin is a stablecoin, backed by the S&P500 and designed as a day-to-day currency.
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";


// ----------------------------------------------------------------------------
// THE:Coin - A crypto-currency pegged to the S&P500
//
// Symbol      : SPY
// Name        : SpyCoin - A cryptocurrency that tracks the S&P500
// Decimals    : 6
//
// Enjoy.
//
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals
//
// NOTE: 100 these is equivalent to 1 share of SPX,
// or *at time of writing* roughly $2.70 USD
// and with 6 decimal places 100,000,000 tokens is 1 share,
// and 1 token has an approximate value of 0.00027c USD
// ----------------------------------------------------------------------------
contract TheCoin is ERC20Upgradeable, AccessControlUpgradeable {

    // An account may be subject to a timeout, during which
    // period it is forbidden from transferring its value
    mapping(address => uint) freezeUntil;

    // A stored list of timestamps that are used to uniquely
    // specify transactions running through paidTransaction.
    // Each tx comes with a timestamp that must be higher than
    // the last tx timestamp, and (more or less) be in the
    // same time as the block being mined.  This ensures
    // tx authentications are unique, and expire
    // relatively shortly after issue
    mapping(address => uint) lastTxTimestamp;

    // The following addresses have different roles

    // TapCapManager is responsible for periodically
    // processing the externally managed TapCap feature
    address role_TapCapManager;
    // The Minter is permitted to mint/melt coins.
    // All coins minted/melted by the minter are
    // from/to TheReserves address
    address role_Minter;
    // THE Coin reserve address.  This is the address
    // directly managed by the THE Coin Inc.  Users
    // interact with this address when purchase/redeem coins
    address role_TheCoin;
    // The Police have very limited powers, they may
    // freeze accounts but nothing else
    address role_Police;

    // Enforcing a set/accept 2 step process for setting roles
    // creates a strong guarantee that we can't f* up and set
    // the roles to an invalid address
    address new_TapCapManager;
    address new_Minter;
    address new_TheCoin;
    address new_Police;

    // Two special-case events include extra information (balance & timestamp)
    // for tracking & tax record reasons
    event Purchase(address purchaser, uint amount, uint balance, uint timestamp);
    event Redeem(address purchaser, uint amount, uint balance, uint timestamp);

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    function initialize(address _sender) public initializer
    {
      __ERC20_init("TheCoin", "THE");

        // We initialize all roles to owner.
        // It is expected that Owner will distribute
        // these roles to others
        role_TapCapManager = _sender;
        role_Minter = _sender;
        role_TheCoin = _sender;
        role_Police = _sender;
    }

    function decimals() public view virtual override returns (uint8) {
      return 6;
    }

    function getRoles() public view returns(address,address,address,address)
    {
        return (role_TapCapManager, role_Minter, role_TheCoin, role_Police);
    }

    // ------------------------------------------------------------------------
    // Total supply management
    // ------------------------------------------------------------------------

    // The owner will periodically add new coins to match
    // shares purchased of SPY
    function mintCoins(uint amount) public
        onlyMinter
    {
        _mint(role_TheCoin, amount);
    }

    // Remove coins
    function meltCoins(uint amount) public
        onlyMinter
    {
        _burn(role_TheCoin, amount);
    }

    // Coins currently owned by clients (not TheCoin)
    function coinsCirculating() public view returns(uint)
    {
        return totalSupply() - balanceOf(role_TheCoin);
    }

    // Coins available for sale to the public
    function reservedCoins() public view returns (uint balance)
    {
        return balanceOf(role_TheCoin);
    }

    // ------------------------------------------------------------------------
    // Additional paid-transfer functions allows a client to sign a request
    // and for the request to be paid by someone else (likely us)
    // Apparently this is now a thing (gass-less transactions), but our
    // implementation appears significantly more efficient.
    // ------------------------------------------------------------------------

    function certifiedTransfer(address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature)
    public
    timestampIncreases(from, timestamp)
    isTransferable(from, value + fee)
    {
        address signer = recoverSigner(from, to, value, fee, timestamp, signature);
        require(signer == from, "Invalid signature for address");
        _transfer(from, to, value);
        _transfer(from, msg.sender, fee);

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

    // Users purchase coin from brokers.  This function is used to declare
    // a transfer with a precise timestamp to ensure we can reconstruct the fx price
    // of this transaction later.
    // NOTE: timestamp is in seconds
    function coinPurchase(address purchaser, uint amount, uint /*timeout*/, uint timestamp) public
    {
        _transfer(msg.sender, purchaser, amount);
        //freezeUntil[purchaser] = timeout;
        emit Purchase(purchaser, amount, balanceOf(purchaser), timestamp);
    }

    // A user returns their coins to us (this will trigger disbursement externally)
    // We record the precise timestamp to ensure we can reconstruct the price
    // of this transaction later
    function coinRedeem(uint amount, address redeemer, uint timestamp) public
    {
        // first, we recover the coins back to our own account
        _transfer(msg.sender, redeemer, amount);
        emit Redeem(msg.sender, amount, balanceOf(msg.sender), timestamp);
    }

    // ------------------------------------------------------------------------
    // Sets a timeout, until which time the user will not
    // account may not be transacted against.
    // ------------------------------------------------------------------------
    function setAccountFreezeTime(address account, uint time) public
    onlyPolice
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
    // Allow updating our key users
    // ------------------------------------------------------------------------
    function setTapCapManager(address newManager) public
    onlyTapCapManager
    {
        new_TapCapManager = newManager;
    }
    function acceptTapCapManager() public
    {
        require(msg.sender == new_TapCapManager, "Permission Denied");
        role_TapCapManager = new_TapCapManager;
        new_TapCapManager = address(0);
    }

    function setMinter(address newMinter) public
    onlyMinter
    {
        new_Minter = newMinter;
    }
    function acceptMinter() public
    {
        require(msg.sender == new_Minter, "Permission Denied");
        role_Minter = new_Minter;
        new_Minter = address(0);
    }

    function setTheCoin(address newCoinManager) public
    onlyTheCoin
    {
        new_TheCoin = newCoinManager;
    }
    function acceptTheCoin() public
    {
        require(msg.sender == new_TheCoin, "Permission Denied");
        role_TheCoin = new_TheCoin;
        new_TheCoin = address(0);
    }

    function setPolice(address newPolice) public
    onlyPolice
    {
        new_Police = newPolice;
    }
    function acceptPolice() public
    {
        require(msg.sender == new_Police, "Permission Denied");
        role_Police = new_Police;
        new_Police = address(0);
    }

    // ------------------------------------------------------------------------
    // Owner can transfer out any ERC20 tokens accidentally assigned to this contracts address
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(address tokenAddress, uint256 tokens) public onlyTheCoin returns (bool success) {
        IERC20Upgradeable tokenContract = IERC20Upgradeable(tokenAddress);
        return tokenContract.transfer(role_TheCoin, tokens);
    }

    // ------------------------------------------------------------------------
    // Override hooks to ensure
    // ------------------------------------------------------------------------
    function _beforeTokenTransfer(address from, address to, uint256 amount) isTransferable(from, amount)
        internal virtual override // Add virtual here!
    {
      super._beforeTokenTransfer(from, to, amount);
    }

    ///////////////////////////////
    // modifier balanceAvailable(uint amount) {
    //     require(_balances[msg.sender] >= amount, "Caller has insufficient balance");
    //     _;
    // }

    modifier isTransferable(address from, uint amount) {
        //require(_balances[from] >= amount, "Caller has insufficient balance");
        require(freezeUntil[from] < block.timestamp, "Caller's account is currently frozen");
        _;
    }

    modifier onlyTapCapManager()
    {
        require(msg.sender == role_TapCapManager, "Invalid sender");
        _;
    }

    modifier onlyMinter()
    {
        require(msg.sender == role_Minter, "Invalid sender");
        _;
    }

    modifier onlyTheCoin()
    {
        require(msg.sender == role_TheCoin, "Invalid sender");
        _;
    }

    modifier onlyPolice()
    {
        require(msg.sender == role_Police, "Invalid sender");
        _;
    }

    modifier timestampIncreases(address from, uint256 timestamp)
    {
        require(timestamp > lastTxTimestamp[from], "Provided timestamp is lower than recorded timestamp");
        _;
    }
}
