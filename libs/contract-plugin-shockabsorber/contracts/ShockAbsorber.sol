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
  int constant FLOAT_FACTOR = 100_000_000_000;
  // milliseconds in a gregorian year.  Should be accurate for the next 1000 years.
  int constant YEAR_IN_MS = 31556952_000;

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

  function initialize(address baseContract, address oracle) public initializer {
    __Ownable_init();

    setFeed(oracle);
    theCoin = IPluggable(baseContract);

    // The amount of down to absorb is 50%
    maxCushionDown = (50 * FLOAT_FACTOR) / 100;
    // The cushionUp is first 1.5% of profit.
    maxCushionUp = (15 * FLOAT_FACTOR) / 1000;
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
    cushions[user].fiatPrincipal = fiatBalance;
    cushions[user].cushionLastAdjust = msNow();
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
    console.log("currentBalance: ", uint(currentBalance));

    int currentFiat = toFiat(currentBalance, msNow());
    UserCushion memory userCushion = cushions[user];
    int fiatPrincipal = userCushion.fiatPrincipal;
    if (currentFiat < fiatPrincipal) {
      int cushion = calcCushionDown(fiatPrincipal, currentBalance, currentFiat, maxCushionDown);
      return currentBalance + cushion;
    }
    else if (currentFiat > fiatPrincipal) {
      // The reserve amount applies fresh each year
      int yearMultiplier = int(1 + int(msNow() - userCushion.cushionLastAdjust) / YEAR_IN_MS);
      int maxCushionUpForYear = maxCushionUp * yearMultiplier;
      int reserve = calcCushionUp(fiatPrincipal, currentBalance, currentFiat, maxCushionUpForYear);
      return currentBalance - reserve;
    }
    else {
      return currentBalance;
    }
  }

  // NOTE: The two calc* functions are declared as pure so we can test them directly in jest
  function calcCushionDown(int fiatPrincipal, int currentCoin, int currentFiat, int _maxCushionDown) public view returns(int) {

    console.log("currentFiat: ", uint(currentFiat));
    console.log("currentFiat: ", uint(currentCoin));
    // how many $ loss are we looking at?
    int fiatLoss = fiatPrincipal - currentFiat;
    console.log("fiatLoss: ", uint(fiatLoss));

    // What ratio are we protecting (we only protect maxFiatProtected)
    int fiatProtected = fiatPrincipal;
    int coinProtected = currentCoin;
    if (fiatProtected > maxFiatProtected) {
      fiatProtected = maxFiatProtected;
      coinProtected = (currentCoin * maxFiatProtected) / fiatPrincipal;
    }
    console.log("fiatProtected: ", uint(fiatProtected));
    console.log("coinProtected: ", uint(coinProtected));

    // How much is this in percent?
    int percentLoss = (fiatLoss * FLOAT_FACTOR) / fiatPrincipal;
    if (percentLoss > _maxCushionDown) {

      // Ok, we just take (coin * maxCushion * percentage of coin protected
      // So, for 50% loss on 50c, we want to return 50c.
      int finalCoin = (coinProtected * fiatProtected * FLOAT_FACTOR) / (_maxCushionDown * fiatProtected);
      console.log("finalCoin: ", uint(finalCoin));
      int coinCushion = finalCoin - coinProtected;
      console.log("coinCushion: ", uint(coinCushion));
      return coinCushion;
      // Reduce principal (and loss) by the excess percentage
      // This limits the max coin cushion to _maxCushionDown * principalInCoin
      // int excessPercent = percentLoss - _maxCushionDown;
      // console.log("excessPercent: ", uint(excessPercent));
      // int principalRedectionPercent = (excessPercent * FLOAT_FACTOR) / _maxCushionDown;
      // console.log("principalRedectionPercent: ", uint(principalRedectionPercent));
      // int excessFiatLoss = (principalRedectionPercent * fiatProtected) / FLOAT_FACTOR;
      // console.log("excessFiatLoss: ", uint(excessFiatLoss));
      // fiatProtected = fiatProtected - excessFiatLoss;
      // percentLoss = _maxCushionDown;
    }
    console.log("percentLoss: ", uint(percentLoss));


    // So how much do we need to boost the fiat balance by?
    int fiatLossToProtect = (fiatProtected * percentLoss) / FLOAT_FACTOR;
    console.log("fiatLossToProtect: ", uint(fiatLossToProtect));

    int percentOfFiat = (fiatLossToProtect * FLOAT_FACTOR) / (fiatProtected - fiatLossToProtect);
    console.log("percentOfFiat: ", uint(percentOfFiat));

    // Next, how much coin is that of the principal?
    // C0.7389162... = 0.014778 * C50
    int coinToAdd = (coinProtected * percentOfFiat) / FLOAT_FACTOR;
    console.log("coinToAdd: ", uint(coinToAdd));

    return coinToAdd;
  }

  function calcCushionUp(int fiatPrincipal, int currentCoin, int currentFiat, int yearCushionUp) public pure returns(int) {
    int fiatGain = currentFiat - fiatPrincipal;
    // console.log("fiatGain: ", uint(fiatGain));

    // How much is this in percent?
    int percentToReserve = (fiatGain * FLOAT_FACTOR) / fiatPrincipal;
    if (percentToReserve > yearCushionUp) {
      percentToReserve = yearCushionUp;
    }
    // console.log("percentToReserve: ", uint(percentToReserve));

    // The reserve only applies to the portion of principal that is cushioned
    int fiatProtected = fiatPrincipal;
    int coinProtected = currentCoin;
    if (fiatPrincipal > maxFiatProtected) {
      fiatProtected = maxFiatProtected;
      coinProtected = (currentCoin * maxFiatProtected) / fiatPrincipal;
    }
    // console.log("fiatProtected: ", uint(fiatProtected));
    // console.log("coinProtected: ", uint(coinProtected));

    // We can't just calculate the cushion based on current prices
    // because we have to figure out what the coin difference would be
    // when the max cushion is reached.

    // Lets assume $5000 fiatPrincipal, C50 coin principal, and cushionMax of 1.5%

    // First, calculate what the fiat value would be when max is reached
    // $75 = $5000 * (101.5%) - $5000.  At 1.5% profit, the $75 generated goes to the reserve
    int fiatToReserve = ((fiatProtected * (FLOAT_FACTOR + percentToReserve)) / FLOAT_FACTOR) - fiatProtected;
    // console.log("fiatToReserve: ", uint(fiatToReserve));

    // Now what percentage is that fiat of the principal?
    // 0.014778... = $75 / ($5000 + $75)
    int percentOfFiat = (fiatToReserve * FLOAT_FACTOR) / (fiatProtected + fiatToReserve);
    // console.log("percentOfFiat: ", uint(percentOfFiat));

    // Next, how much coin is that of the principal?
    // C0.7389162... = 0.014778 * C50
    int coinToReserve = (coinProtected * percentOfFiat) / FLOAT_FACTOR;
    // console.log("coinToReserve: ", uint(coinToReserve));

    return coinToReserve;
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
    console.log("preDeposit: ", uint(coin));
    int fiatDeposit = toFiat(int(coin), msTime);
    // Add to users principal
    cushions[user].fiatPrincipal = cushions[user].fiatPrincipal + fiatDeposit;
    console.log("cushions[user].fiatPrincipal: ", uint(cushions[user].fiatPrincipal));
  }

  // ------------------------------------------------------------------------
  // Owners functionality
  // ------------------------------------------------------------------------
  function drawDownCushion(address user) public {
    UserCushion memory userCushion = cushions[user];
    // Wait > 1 year
    int yearsPassed =  int(msNow() - userCushion.cushionLastAdjust) / YEAR_IN_MS;
    if (yearsPassed == 0) {
      return;
    }

    int currentBalance = theCoin.pl_balanceOf(user);
    // int currentFiat = toFiat(currentBalance, msNow());
    // Ignore the current price.  We always draw down the full amount allowed
    // If this takes the balance below the actual fiat, the cushion will still
    // apply so the users balance will not go below the cushion
    int currentFiat = userCushion.fiatPrincipal * (maxCushionUp * yearsPassed);
    int principal = userCushion.fiatPrincipal;
    if (currentFiat > principal) {
      // NOTE!  This may not draw down the full 1.5%, as it isn't
      // NOTE: this calcs (up to end of) last years cushion, not the current one

      // maxCushion grows each year too
      int maxCushionUpForYear = maxCushionUp * yearsPassed;
      int cushionCoin = calcCushionUp(principal, currentBalance, currentFiat, maxCushionUpForYear);
      // transfer the cushion to this contract
      theCoin.pl_transferFrom(user, address(this), uint(cushionCoin), msNow());
      userCushion.cushionLastAdjust = userCushion.cushionLastAdjust + uint(yearsPassed * YEAR_IN_MS);
    }
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

