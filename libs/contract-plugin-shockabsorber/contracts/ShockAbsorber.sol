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

import "hardhat/console.sol";

struct UserCushion {
  // CostBasis + the profit over time becomes protected
  int fiatPrincipal;

  // How `coin` is currently adjusted (up or down)
  // Positive values mean we added to `coin` to cushion drop,
  // negative values mean we subbed from `coin` to cushion jump
  int coinAdjustment;

  // When did we last adjust the cushioning?
  uint cushionLastAdjust;
}


contract ShockAbsorber is BasePlugin, OracleClient, OwnableUpgradeable, PermissionUser {

  // By default, we protect up to $5000
  int constant maxFiatProtected = 5000_00;
  // Essentially how many significant figures when doing floating point math.
  int constant FLOAT_FACTOR = 100_000_000;
  // The percentage drop absorbed
  int maxCushionDown;

  // What percentage yearly gains go towards
  // building the cushion?
  int maxCushionUp;

  // We list "to" first, as that is the value most likely to be repeated
  // From => { To => Timestamp => Value }
  mapping(address => UserCushion) cushions;

  uint numClients = 0;

  // Link back to core contract.
  IPluggable internal theCoin;

  // The currency code this client supports.
  uint16 constant CurrencyCode = 124;

  function initialize(address baseContract, address oracle) public initializer {
    __Ownable_init();

    setFeed(oracle);
    theCoin = IPluggable(baseContract);

    // The amount of down to absorb is 50%
    maxCushionDown = (50 * FLOAT_FACTOR) / 100;
    // The cushionUp is first 1.5% of profit.
    maxCushionUp = (15 * FLOAT_FACTOR) / 100;
  }

  // ------------------------------------------------------------------------
  // TESTING FUNCTIONS - REMOVE PRIOR TO PROD PUBLISH
  // ------------------------------------------------------------------------
  function seedPending(address from, address to, uint amount, uint msTransferAt, uint msSignedAt) public onlyOwner{
    // This can only run on testing blockchains.
    // require(block.chainid == 0x13881 || block.chainid == 31337, "testing only");
    // pending[from].transfers[to][msTransferAt] = pending[from].transfers[to][msTransferAt] + amount;
    // pending[from].total = pending[from].total + amount;
    // emit ValueChanged(from, msSignedAt, "pending[user].total", int(pending[from].total));
  }

  // ------------------------------------------------------------------------
  // IPlugin Implementation
  // ------------------------------------------------------------------------
  // We modify transfers
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_BALANCE & PERMISSION_DEPOSIT & PERMISSION_WITHDRAWAL & PERMISSION_AUTO_ACCESS;
  }

  function userAttached(address user, address) override external onlyBaseContract {
    require(cushions[user].fiatPrincipal == 0, "User is already attached");
    require(numClients < 25, "Client limit reached");

    int coinBalance = theCoin.pl_balanceOf(user);
    int fiatBalance = toFiat(coinBalance, msNow());
    // cushions[user].cushionUp = 15;
    // cushions[user].cushionDown = 500;
    cushions[user].fiatPrincipal = fiatBalance;
    numClients = numClients + 1;
  }

  function userDetached(address /*exClient*/, address /*initiator*/) override external onlyBaseContract {
    // Total == 0 means no transfers remaining
    // require(pending[exClient].total == 0, "Cannot remove plugin while a transaction is pending");
    // delete pending[exClient];

    numClients = numClients - 1;
    // TODO:
  }

  // We automatically modify the balance to adjust for market fluctuations.
  function balanceOf(address user, int currentBalance) external view override returns(int)
  {
    int currentFiat = toFiat(currentBalance, msNow());
    int principal = cushions[user].fiatPrincipal;
    if (currentFiat < principal) {
      return cushionDown(principal, currentBalance, currentFiat);
    }
    else {
      return cushionUp(principal, currentBalance, currentFiat);
    }
  }

  function cushionDown(int fiatPrincipal, int currentCoin, int currentFiat) public view returns(int) {
    console.log("currentFiat: ", uint(currentFiat));
    // how many $ loss are we looking at?
    int fiatLoss = fiatPrincipal - currentFiat;

    console.log("fiatLoss: ", uint(fiatLoss));
    // How much is this in percent?
    int percentLoss = (fiatLoss * FLOAT_FACTOR) / fiatPrincipal;
    if (percentLoss > maxCushionDown) {
      // Reduce principal (and loss) by the excess percentage
      // This limits the max coin cushion to maxCushionDown * principalInCoin
      int excess = percentLoss - maxCushionDown;
      int principalReduction = (excess * fiatPrincipal) / (maxCushionDown);
      console.log("principalReduction: ", uint(principalReduction));
      fiatPrincipal = fiatPrincipal - principalReduction;
      percentLoss = maxCushionDown;
    }
    console.log("percentLoss: ", uint(percentLoss));
    // What ratio are we protecting (we only protect maxFiatProtected)
    int fiatProtected = fiatPrincipal;
    if (fiatProtected > maxFiatProtected) fiatProtected = maxFiatProtected;
    console.log("fiatProtected: ", uint(fiatProtected));

    // So how much do we need to boost the fiat balance by?
    int fiatLossToProtect = (fiatProtected * percentLoss) / FLOAT_FACTOR;
    console.log("fiatLossToProtect: ", uint(fiatLossToProtect));

    // how much is this in coin?
    int coinLossToProtect = toCoin(fiatLossToProtect, msNow());
    console.log("coinLossToProtect: ", uint(coinLossToProtect));

    return currentCoin + coinLossToProtect;
  }

  function cushionUp(int fiatPrincipal, int currentCoin, int currentFiat) public view returns(int) {
    // how many $ up are we looking at?
    int fiatGain = currentFiat - fiatPrincipal;

    // How much is this in percent?
    int percentGain = (fiatGain * FLOAT_FACTOR) / currentFiat;
    if (percentGain > maxCushionUp) {
      percentGain = maxCushionUp;
    }

    // How much dosh is that
    int fiatToReserve = fiatPrincipal * percentGain / FLOAT_FACTOR;

    return currentCoin - toCoin(fiatToReserve, msNow());
  }

  // //
  // // What do we want to do about this particular transaction?
  // function modifyTransfer(address from, address to, uint amount, uint16 currency, uint msTransferAt, uint msSignedAt)
  //   external override onlyBaseContract
  //   returns (uint finalAmount, uint16 finalCurrency)
  // {
  //   (finalAmount, finalCurrency) = (amount, currency);
  //   // We only care about CAD  transactions
  //   if (currency == CurrencyCode) {

  //     // If this is scheduled to happen in the future?
  //     if (msTransferAt > msNow()) {
  //       pending[from].transfers[to][msTransferAt] = pending[from].transfers[to][msTransferAt] + amount;
  //       pending[from].total = pending[from].total + amount;
  //       finalAmount = 0;
  //       emit ValueChanged(from, msSignedAt, "pending[user].total", int(pending[from].total));
  //     }
  //     // Happening now, so convert to Coin
  //     else {
  //       finalAmount = toCoin(amount, msTransferAt);
  //       finalCurrency = 0;
  //     }
  //   }
  //   return (finalAmount, finalCurrency);
  // }

  // // This function can be safely made public as it can only
  // // process transactions that have already been registered
  // function processPending(address from, address to, uint msTime) public
  // {
  //   require(msTime <= msNow(), "Cannot process future transactions");

  //   PendingTransactions storage user = pending[from];
  //   uint fiat = user.transfers[to][msTime];
  //   if (fiat > 0) {
  //     uint coin = uint(toCoin(fiat, msTime));
  //     theCoin.pl_transferFrom(from, to, coin, msTime);
  //     delete user.transfers[to][msTime];
  //     user.total = user.total - fiat;
  //     emit ValueChanged(from, msTime, "pending[user].total", int(user.total));
  //   }
  // }

  // ------------------------------------------------------------------------
  // Pending transactions prevent withdrawals
  // ------------------------------------------------------------------------
  function preWithdraw(address user, uint balance, uint coin, uint msTime) public virtual override returns(uint) {

    int fiatWithdraw = toFiat(int(coin), msTime);
    // Remove this withdrawal from principal
    cushions[user].fiatPrincipal = cushions[user].fiatPrincipal - fiatWithdraw;
    // TODO: Gross up the users account here...
    return balance;
  }

  function preDeposit(address user, uint coin, uint msTime) public virtual override  {

    int fiatDeposit = toFiat(int(coin), msTime);
    // Add to users principal
    cushions[user].fiatPrincipal = cushions[user].fiatPrincipal + fiatDeposit;
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

