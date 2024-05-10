/// @title Convert Currency & Time on-chain
/// @author Stephen Taylor
/// @notice This plugin unlocks TheCoin from being tied to the stock
/// market.  It allows converting currencies online and implements
/// a delayable non-revokable allowance to permit Brokers to complete
/// payments outside of trading hours, letting the trades settle at the
/// time specified.

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import '@thecointech/contract-oracle/contracts/OracleClient.sol';
import '@thecointech/contract-plugins/contracts/BasePlugin.sol';
import '@thecointech/contract-plugins/contracts/permissions.sol';
import '@thecointech/contract-plugins/contracts/IPluggable.sol';

struct PendingTransactions {
  // The currency code of the value (eg 124 for $CAD)
  // uint8 currency;
  // For now, just assume CAD
  // We could (?) provide a new Converter per-currency?
  // The total value owed to all users (in currency)
  uint total;
  // to => timestamp => value
  mapping(address => mapping(uint => uint)) transfers;
}


contract UberConverter is BasePlugin, OracleClient, OwnableUpgradeable, PermissionUser {

  // We list "to" first, as that is the value most likely to be repeated
  // From => { To => Timestamp => Value }
  mapping(address => PendingTransactions) pending;

  // Link back to core contract.
  IPluggable internal theCoin;

  // The currency code this client supports.
  uint16 constant CurrencyCode = 124;

  function initialize(address baseContract, address oracle) public initializer {
    __Ownable_init();

    setFeed(oracle);
    theCoin = IPluggable(baseContract);
  }

  function setOracle(address oracle) public onlyOwner() {
    setFeed(oracle);
  }

  // ------------------------------------------------------------------------
  // TESTING FUNCTIONS - REMOVE PRIOR TO PROD PUBLISH
  // ------------------------------------------------------------------------
  function seedPending(address from, address to, uint amount, uint msTransferAt, uint msSignedAt) public onlyOwner{
    // This can only run on testing blockchains.
    require(block.chainid == 0x13881 || block.chainid == 31337, "testing only");
    pending[from].transfers[to][msTransferAt] = pending[from].transfers[to][msTransferAt] + amount;
    pending[from].total = pending[from].total + amount;
    emit ValueChanged(from, msSignedAt, "pending[user].total", int(pending[from].total));
  }

  // ------------------------------------------------------------------------
  // IPlugin Implementation
  // ------------------------------------------------------------------------
  // We modify transfers
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_AUTO_ACCESS & PERMISSION_WITHDRAWAL;
  }

  function userDetached(address exClient, address /*initiator*/) override external onlyBaseContract {
    // Total == 0 means no transfers remaining
    require(pending[exClient].total == 0, "Cannot remove plugin while a transaction is pending");
    delete pending[exClient];
  }

  // We automatically modify the balance to adjust for market fluctuations.
  function balanceOf(address user, int currentBalance) external view override returns(int)
  {
    PendingTransactions storage userPending = pending[user];
    if (userPending.total != 0) {
      // How much does our owed amount turn into?
      uint owed = toCoin(userPending.total, msNow());
      return currentBalance - int(owed);
    }
    return currentBalance;
  }

  //
  // What do we want to do about this particular transaction?
  function modifyTransfer(address from, address to, uint amount, uint16 currency, uint msTransferAt, uint msSignedAt)
    external override onlyBaseContract
    returns (uint finalAmount, uint16 finalCurrency)
  {
    (finalAmount, finalCurrency) = (amount, currency);
    // We only care about CAD  transactions
    if (currency == CurrencyCode) {

      // If this is scheduled to happen in the future?
      // TEMP ONLY - REMOVE AFTER CREATING DEMO ACCOUNT
      if (msTransferAt > msNow()) {
        pending[from].transfers[to][msTransferAt] = pending[from].transfers[to][msTransferAt] + amount;
        pending[from].total = pending[from].total + amount;
        finalAmount = 0;
        emit ValueChanged(from, msSignedAt, "pending[user].total", int(pending[from].total));
      }
      // Happening now, so convert to Coin
      else {
        finalAmount = toCoin(amount, msTransferAt);
        finalCurrency = 0;
      }
    }
    return (finalAmount, finalCurrency);
  }

  // This function can be safely made public as it can only
  // process transactions that have already been registered
  function processPending(address from, address to, uint msTime) public
  {
    require(msTime <= msNow(), "Cannot process future transactions");

    PendingTransactions storage user = pending[from];
    uint fiat = user.transfers[to][msTime];
    if (fiat > 0) {
      uint coin = uint(toCoin(fiat, msTime));
      theCoin.pl_transferFrom(from, to, coin, msTime);
      delete user.transfers[to][msTime];
      user.total = user.total - fiat;
      emit ValueChanged(from, msTime, "pending[user].total", int(user.total));
    }
  }

  // ------------------------------------------------------------------------
  // Pending transactions prevent withdrawals
  // ------------------------------------------------------------------------
  function preWithdraw(address user, uint balance, uint coin, uint msTime) public virtual override returns(uint) {
    uint userPending = pending[user].total;
    if (userPending != 0) {
      // How much does our owed amount turn into?
      uint owed = toCoin(userPending, msTime);
      require((owed + coin) <= balance, "Cannot withdraw, exceeds balance");
      return balance - owed;
    }
    return balance;
  }

  // ------------------------------------------------------------------------
  // Modifiers
  // ------------------------------------------------------------------------
  modifier onlyBaseContract()
  {
    require(msg.sender == address(theCoin), "Only callable from the base contract");
    _;
  }
}

