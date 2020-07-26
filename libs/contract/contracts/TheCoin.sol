pragma solidity ^0.6.0;

import "./ERC20Local.sol";
import "./LibCertTransfer.sol";

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";


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
contract TheCoin is Initializable, ERC20Local, LibCertTransfer {

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
    function initialize(address _sender) public
        initializer()
    {
        ERC20Local.initialize("THE: Coin", "THE", 6);

        // Lets just double-check this contract has not
        // yet been initialized.
        require(role_TapCapManager == address(0) && role_Minter == address(0), "System compromised.  Freeze Everything");

        // We initialize all roles to owner.
        // It is expected that Owner will distribute
        // these roles to others
        role_TapCapManager = _sender;
        role_Minter = _sender;
        role_TheCoin = _sender;
        role_Police = _sender;
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
        return totalSupply().sub(balanceOf(role_TheCoin));
    }

    // Coins available for sale to the public
    function reservedCoins() public view returns (uint balance)
    {
        return balanceOf(role_TheCoin);
    }

    // ------------------------------------------------------------------------
    // Override standard functions to limit by account freezing
    // ------------------------------------------------------------------------
    function transfer(address to, uint256 value) public override
    isTransferable(msg.sender, value)
    returns (bool)
    {
        return ERC20Local.transfer(to, value);
    }
    function approve(address spender, uint256 value) public override
    isTransferable(msg.sender, value)
    returns (bool)
    {
        return ERC20Local.approve(spender, value);
    }
    function increaseAllowance(address spender, uint256 addedValue) public override
    isTransferable(msg.sender, addedValue)
    returns (bool)
    {
        return ERC20Local.increaseAllowance(spender, addedValue);
    }

    // ------------------------------------------------------------------------
    // Additional paid-transfer functions allows a client to sign a request
    // and for the request to be paid by someone else (likely us)
    // ------------------------------------------------------------------------

    function certifiedTransfer(address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature)
    public
    timestampIncreases(from, timestamp)
    isTransferable(from, value + fee)
    returns (bool)
    {
        address signer = recoverSigner(from, to, value, fee, timestamp, signature);
        require(signer == from, "Invalid signature for address");
        _transfer(from, to, value);
        _transfer(from, msg.sender, fee);

        lastTxTimestamp[from] = timestamp;
    }

    // ------------------------------------------------------------------------
    // Client interactions with TheCoin
    // ------------------------------------------------------------------------

    // Users purchase coin from brokers.  This function is used to declare
    // a transfer with a precise timestamp to ensure we can reconstruct the fx price
    // of this transaction later
    function coinPurchase(address purchaser, uint amount, uint timeout, uint timestamp) public
    isTransferable(msg.sender, amount)
    {
        _transfer(msg.sender, purchaser, amount);
        //freezeUntil[purchaser] = timeout;
        emit Purchase(purchaser, amount, balanceOf(purchaser), timestamp);
    }

    // A user returns their coins to us (this will trigger disbursement externally)
    // We record the precise timestamp to ensure we can reconstruct the price
    // of this transaction later
    function coinRedeem(uint amount, address redeemer, uint timestamp) public
    isTransferable(msg.sender, amount)
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
    // Implement escrow 'accounts' for holding amounts in escrow to be used
    // in offline transactions
    // ------------------------------------------------------------------------

    // TODO: Spending _balances are amounts that
    // are transfered from the _balances into
    // escrow accounts.  These escrow accounts can then
    // be spent against and tracked with local databases
    // and are synced back to the main chain once per week (or so)
    struct TapCapData
    {
        uint TransactionId; // Last processed TC transaction
        uint TapCapEscrow; // How much is currently held in escrow?
        uint TapCapRefill;  // How much should be refilled each week?
    }

    mapping(address => TapCapData) tapCaps;

    event TapCapTopUp(address client, uint topup);
    event TapCapSetWeekly(address client, uint weeklyLimit);
    event TapCapClear(address client);
    event TapCapUserUpdated(address client, int change, uint toppedUp);

    // Event emitted when manually processing TC's
    event TapCapProcessed(address client, address dest, uint amount);

    // Topup the escrow.  NOTE: This will implicitly increase the amount registered by
    // the spending manager.  Those records are separate and not directly
    // linked to the amounts here.
    function tapCapTopUp(uint topup) public
    balanceAvailable(topup)
    {
        TapCapData storage userAccount = tapCaps[msg.sender];
        _balances[msg.sender] = _balances[msg.sender].sub(topup);
        userAccount.TapCapEscrow = userAccount.TapCapEscrow.add(topup);
        emit TapCapTopUp(msg.sender, topup);
    }

    // Set's the weekly TapCap for the user.  Does not affect the current weeks TapCap
    function tapCapSetRefill(uint amount) public
    {
        tapCaps[msg.sender].TapCapRefill = amount;
        emit TapCapSetWeekly(msg.sender, amount);
    }

    // Clear a users TapCap account.  A user may not directly
    // clear an account, as the user may have a TC debit
    // pending from the spending manager.
    function tapCapClear() public
    {
        tapCaps[msg.sender].TapCapRefill = uint(-1);
        emit TapCapClear(msg.sender);
    }

    // Get current values for spending...
    function tapCapUser(address user) public view returns(uint TransactionId, uint TapCapEscrow, uint TapCapRefill)
    {
        return (tapCaps[user].TransactionId, tapCaps[user].TapCapEscrow, tapCaps[user].TapCapRefill);
    }

    //
    // The big puppy.  Update all accounts with changes from spending
    //
    function processSpending(address[] memory users, int[] memory amountChange) public
    onlyTapCapManager()
    {
        uint numChanges = users.length;
        require(numChanges == amountChange.length, "Each entry in users must be matched by an amountChange");

        int totalChange = 0;
        int newTotal = 0;
        for (uint i = 0; i < numChanges; i++)
        {
            address user = users[i];
            int delta = amountChange[i];
            TapCapData storage userAccount = tapCaps[user];
            // Apply the delta to the users account
            if (delta > 0) {
                // Get abs(delta)
                uint pdelta = uint(delta);
                // Add directly to the users regular account.  We may not
                // have permission to interact with the users TapCap
                _balances[user].add(pdelta);

                // Update total.  Can't use safe-math for this, as
                // newTotal is a signed int to allow it to go negative.
                newTotal = totalChange + delta;
                require(newTotal > totalChange, "int Overflow in processSpending: newTotal <= totalChange");
                totalChange = newTotal;
            }
            else {
                // Get abs(delta)
                uint ndelta = uint(-delta);
                userAccount.TapCapEscrow = userAccount.TapCapEscrow.sub(ndelta);

                // Topup the account by an appropriate amount
                if (userAccount.TapCapEscrow < userAccount.TapCapRefill)
                {
                    uint topup = userAccount.TapCapRefill.sub(userAccount.TapCapEscrow);
                    if (topup > _balances[user])
                    {
                        topup = _balances[user];
                    }
                    _balances[user] = _balances[user].sub(topup);
                    userAccount.TapCapEscrow = userAccount.TapCapEscrow.add(topup);
                    emit TapCapUserUpdated(user, delta, topup);
                }

                // Update total
                newTotal = totalChange + delta;
                require(newTotal <= totalChange, "int Underflow in processSpending: newTotal > totalChange");
                totalChange = newTotal;
            }
        }

        require(totalChange == 0, "Cannot resolve spending, amounts do not balance to 0");
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
        IERC20 tokenContract = IERC20(tokenAddress);
        return tokenContract.transfer(role_TheCoin, tokens);
    }

    ///////////////////////////////
    modifier balanceAvailable(uint amount) {
        require(_balances[msg.sender] >= amount, "Caller has insufficient balance");
        _;
    }

    modifier isTransferable(address from, uint amount) {
        require(_balances[from] >= amount, "Caller has insufficient balance");
        require(freezeUntil[from] < now, "Caller's account is currently frozen");
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
