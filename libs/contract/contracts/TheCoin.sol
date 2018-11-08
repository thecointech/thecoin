pragma solidity ^0.4.24;

import './ERC20Local.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/Initializable.sol';

import "openzeppelin-eth/contracts/token/ERC20/IERC20.sol";
// ----------------------------------------------------------------------------
// SpyCoin - A crypto-currency pegged to the SPX (SPY actually)
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
// NOTE: 100 SpyCoins is equivalent to 1 share of SPY,
// or *at time of writing* roughly $2.70 USD
// and with 6 decimal places 100,000,000 tokens is 1 share,
// and 1 token has an approximate value of 0.00027c USD
// ----------------------------------------------------------------------------
contract TheCoin is Initializable, ERC20Detailed, ERC20Local, Ownable {

    // An account may be subject to a timeout, during which
    // period it is forbidden from transferring its value
    mapping(address => uint) freezeUntil;

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
    address role_TheReserves;
    // The Police have very limited powers, they may
    // freeze accounts but nothing else
    address role_Police;

    // Enforcing a set/accept 2 step process for setting roles
    // creates a strong guarantee that we can't f* up and set
    // the roles to an invalid address
    address new_TapCapManager;
    address new_Minter;
    address new_TheReservist;
    address new_Police;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    function initialize(address _sender) public
        initializer() 
    {
        ERC20Detailed.initialize("THE: Coin", "THE", 6);
        Ownable.initialize(_sender);
        
        // Lets just double-check this contract has not
        // yet been initialized.
        require(role_TapCapManager == 0 && role_Minter == 0, "System compromised.  Freeze Everything");

        // We initialize all roles to owner.
        // It is expected that Owner will distribute
        // these roles to others
        role_TapCapManager = _sender;
        role_Minter = _sender;
        role_TheReserves = _sender;
        role_Police = _sender;
    }

    function getRoles() public view returns(address,address,address,address,address)
    {
        address theOwner = owner();
        return (theOwner, role_TapCapManager, role_Minter, role_TheReserves, role_Police);
    }

    // ------------------------------------------------------------------------
    // Total supply management
    // ------------------------------------------------------------------------

    // The owner will periodically add new coins to match
    // shares purchased of SPY
    function mintCoins(uint amount) public
        onlyMinter
    {
        _mint(role_TheReserves, amount);
    }

    // Remove coins
    function meltCoins(uint amount) public
        onlyMinter
    {
        _burn(role_TheReserves, amount);
    }

    // Coins currently owned by clients (not TheCoin)
    function coinsCirculating() public view returns(uint)
    {
        return totalSupply().sub(balanceOf(role_TheReserves));
    }

    // Coins available for sale to the public 
    function reservedCoins() public view returns (uint balance) 
    {
        return balanceOf(role_TheReserves);
    }

    // ------------------------------------------------------------------------
    // Override standard functions to limit by account freezing
    // ------------------------------------------------------------------------
    function transfer(address to, uint256 value) public isTransferable(value) returns (bool) {
        return super.transfer(to, value);
    }
    function approve(address spender, uint256 value) public isTransferable(value) returns (bool) {
        return super.approve(spender, value);
    }
    function increaseAllowance(address spender, uint256 addedValue) public isTransferable(addedValue) returns (bool) {
        return super.increaseAllowance(spender, addedValue);
    }

    // ------------------------------------------------------------------------
    // Client interactions with TheCoin
    // ------------------------------------------------------------------------

    // Users purchase coin from us.  A script on our
    // site will trigger this call
    function coinPurchase(address purchaser, uint amount, uint timeout) public
    onlyTheCoin
    balanceAvailable(amount)
    {
        _transfer(role_TheReserves, purchaser, amount);
        freezeUntil[purchaser] = timeout;
    }

    // A user returns their coins to us (this will trigger disbursement externally)
    function coinRedeem(uint amount) public
    isTransferable(amount)
    {
        // first, we recover the coins back to our own account
        _transfer(msg.sender, role_TheReserves, amount);
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
    function processSpending(address[] users, int[] amountChange) public
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
    function () public payable {
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
        new_TapCapManager = 0;
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
        new_Minter = 0;
    }

    function setTheReserves(address newReservist) public 
    onlyTheCoin
    {
        new_TheReservist = newReservist;
    }
    function acceptReservist() public 
    {
        require(msg.sender == new_TheReservist, "Permission Denied");
        role_TheReserves = new_TheReservist;
        new_TheReservist = 0;
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
        new_Police = 0;
    }
    // ------------------------------------------------------------------------
    // Owner can transfer out any ERC20 tokens accidentally assigned to this contracts address
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(address tokenAddress, uint256 tokens) public onlyOwner returns (bool success) {
        IERC20 tokenContract = IERC20(tokenAddress);
        return tokenContract.transfer(owner(), tokens);
    }

    ///////////////////////////////
    modifier balanceAvailable(uint amount) {
        require(_balances[msg.sender] >= amount, "Caller has insufficient balance");
        _;
    }

    modifier isTransferable(uint amount) {
        require(_balances[msg.sender] >= amount, "Caller has insufficient balance");
        require(freezeUntil[msg.sender] < now, "Caller's account is currently frozen");
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
        require(msg.sender == role_TheReserves, "Invalid sender");
        _;
    }

    modifier onlyPolice()
    {
        require(msg.sender == role_Police, "Invalid sender");
        _;
    }
}