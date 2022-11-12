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
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import '@thecointech/contract-oracle/contracts/OracleClient.sol';
import '@thecointech/contract-core/contracts/plugins/BasePlugin.sol';
import '@thecointech/contract-core/contracts/interfaces/permissions.sol';
import '@thecointech/contract-core/contracts/interfaces/IPluggable.sol';

import "hardhat/console.sol";

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


contract UberConverter is BasePlugin, OracleClient, Ownable, PermissionUser {

  // We list "to" first, as that is the value most likely to be repeated
  // From => { To => Timestamp => Value }
  mapping(address => PendingTransactions) pending;

  // Link back to core contract.
  IPluggable internal theCoin;

  // The currency code this client supports.
  uint16 constant CurrencyCode = 124;

  constructor(address baseContract, address oracle)
  {
    setFeed(oracle);
    theCoin = IPluggable(baseContract);
  }

  // We modify transfers
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_AUTO_ACCESS & PERMISSION_WITHDRAWAL;
  }

  // If this is a new user, we initialize the guard to their fiat amount.
  function userAttached(address newUser, address initiator) override external onlyBaseContract {

  }

  // When a user removes this plugin, we clear any balance owing.
  function userDetached(address exClient, address initiator) override external onlyBaseContract {
    require(owner() == initiator, "only owner may detach this plugin");
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
      uint owed = toCoin(userPending.total, block.timestamp);
      return currentBalance - int(owed);
    }
    return currentBalance;
  }

  //
  // What do we want to do about this particular transaction?
  function modifyTransfer(address from, address to, uint amount, uint16 currency, uint timestamp)
    external override onlyBaseContract
    returns (uint finalAmount, uint16 finalCurrency)
  {
    (finalAmount, finalCurrency) = (amount, currency);
    // We only care about CAD  transactions
    if (currency == CurrencyCode) {

      // If this is scheduled to happen in the future?
      console.log("Converting Transfer at", timestamp, " in block ", block.timestamp);

      if (timestamp > block.timestamp) {
        pending[from].transfers[to][timestamp] = pending[from].transfers[to][timestamp] + amount;
        pending[from].total = pending[from].total + amount;
        finalAmount = 0;
      }
      // Happening now, so convert to Coin
      else {
        finalAmount = toCoin(amount, timestamp);
        finalCurrency = 0;
      }
    }
    return (finalAmount, finalCurrency);
  }

  // This function can be safely made public as it can only
  // process transactions that have already been registered
  function processPending(address from, address to, uint timestamp) public
  {
    require(timestamp <= block.timestamp, "Cannot process future transactions");

    PendingTransactions storage user = pending[from];
    uint fiat = user.transfers[to][timestamp];
    if (fiat > 0) {
      uint coin = uint(toCoin(fiat, timestamp));
      theCoin.pl_transferFrom(from, to, coin);
      delete user.transfers[to][timestamp];
      user.total = user.total - fiat;
    }
  }
  // ------------------------------------------------------------------------
  // Pending transactions prevent withdrawals
  // ------------------------------------------------------------------------
  function preWithdraw(address user, uint balance, uint coin, uint timestamp) public virtual override returns(uint) {
    uint userPending = pending[user].total;
    if (userPending != 0) {
      // How much does our owed amount turn into?
      uint owed = toCoin(userPending, timestamp);
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
    require(msg.sender == address(theCoin), "Action requires Plugin Manager role");
    _;
  }
}

