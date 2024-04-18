/// @title ShockAbsorber - smooth market movements
/// @author Stephen Taylor
/// @notice Smooths out the ups & downs of market movement.
/// Each year reserves the first maxCushionUp percent of profit,
/// and when the market drops it ensures the user does not lose any principal


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

// import "hardhat/console.sol";

// This could definitely be optimized...
struct UserCushion {
  // CostBasis + the profit over time becomes protected
  int fiatPrincipal;

  // How `coin` is currently adjusted (up or down)
  // Positive values mean we added to `coin` to cushion drop,
  // negative values mean we subbed from `coin` to cushion jump
  int coinAdjustment;

  // When did this account attach?
  uint initTime;

  // When did we last adjust the cushioning?
  uint lastDrawDownTime;

  // Averages used to calculate drawdown
  int avgFiatPrincipal;
  int avgCoinPrincipal;
  uint lastAvgAdjustTime;

  // Used to calculate the down cushion
  int reserved;
  int maxCovered;
  int maxCoverAdjust;
}

contract ShockAbsorber is BasePlugin, OracleClient, OwnableUpgradeable, PermissionUser {

  // By default, we protect up to $5000
  int constant maxFiatProtected = 5000_00;
  // Essentially how many significant figures when doing floating point math.
  int constant FLOAT_FACTOR = 100_000_000_000;
  int constant FLOAT_FACTOR_SQ = FLOAT_FACTOR * FLOAT_FACTOR;
  // milliseconds in a gregorian year.  Should be accurate for the next 1000 years.
  int constant YEAR_IN_MS = 31556952_000;

  // The percentage drop absorbed
  int maxCushionDown;

  // What percentage yearly gains go towards
  // building the cushion?
  int maxCushionUp;

  int maxCushionUpPercent;

  mapping(address => UserCushion) cushions;

  uint numClients;

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
    maxCushionUpPercent = FLOAT_FACTOR - (FLOAT_FACTOR * FLOAT_FACTOR / (FLOAT_FACTOR + maxCushionUp));
  }

  function getCushion(address user) public view returns(UserCushion memory) {
    return cushions[user];
  }

  function setOracle(address oracle) public onlyOwner() {
    setFeed(oracle);
  }

  // ------------------------------------------------------------------------
  // IPlugin Implementation
  // ------------------------------------------------------------------------
  // We modify transfers
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_BALANCE & PERMISSION_DEPOSIT & PERMISSION_WITHDRAWAL & PERMISSION_AUTO_ACCESS;
  }

  function userAttached(address user, uint timeMs, address) override external onlyBaseContract {
    require(cushions[user].initTime == 0, "User is already attached");
    require(numClients < 25, "Client limit reached");

    int coinBalance = theCoin.pl_balanceOf(user);
    int fiatBalance = toFiat(coinBalance, msNow()); // always calculate fiat now (?)
    int maxCovered = (FLOAT_FACTOR * int(coinBalance)) / (FLOAT_FACTOR - maxCushionDown);
    cushions[user].fiatPrincipal = fiatBalance;
    cushions[user].maxCovered = maxCovered;
    cushions[user].lastAvgAdjustTime = timeMs;
    cushions[user].lastDrawDownTime = timeMs;
    cushions[user].initTime = timeMs;

    emit ValueChanged(user, timeMs, "cushions[user].fiatPrincipal", fiatBalance);
    emit ValueChanged(user, timeMs, "cushions[user].maxCovered", maxCovered);
    emit ValueChanged(user, timeMs, "cushions[user].initTime", int(timeMs));

    numClients = numClients + 1;
  }

  function userDetached(address exClient, address /*initiator*/) override external onlyBaseContract {
    // NOTE: THIS IS NOT TESTED (hopefully don't use it for a few years...)
    // IT PROBABLY WONT WORK AS EXPECTED DUE TO FRACTIONAL YEARS NOT TESTED
    _drawDownCushion(exClient, msNow());
    delete cushions[exClient];
    numClients = numClients - 1;
  }

  // We automatically modify the balance to adjust for market fluctuations.
  function balanceOf(address user, int currentBalance) external view override returns(int)
  {
    // console.log("currentBalance: ", uint(currentBalance));
    UserCushion storage userCushion = cushions[user];

    uint timeMs = msNow();
    // int coinPrincipal = toCoin(userCushion.fiatPrincipal, timeMs);
    int currentFiat = toFiat(currentBalance, timeMs);
    int fiatPrincipal = userCushion.fiatPrincipal;
    if (currentFiat < fiatPrincipal) {
      int cushion = _calcCushionDown(userCushion, currentBalance, timeMs);
      return currentBalance + cushion;
    }
    else if (currentFiat > fiatPrincipal) {
      int reserve = _calcCushionUp(userCushion, currentBalance, timeMs);
      return currentBalance - reserve;
    }
    else {
      return currentBalance;
    }
  }

  // Public-access for testing
  function calcCushionUp(address user, int coinBalance, uint timeMs) public view returns(int) {
    UserCushion storage userCushion = cushions[user];
    return _calcCushionUp(userCushion, coinBalance, timeMs);
  }

  function _calcCushionUp(UserCushion storage user, int coinBalance, uint timeMs) internal view returns(int) {
    if (user.fiatPrincipal == 0) {
      return 0;
    }

    // The reserve amount applies fresh each year
    int msPassed = int(timeMs - user.initTime);
    // console.log("msPassed: ", uint(msPassed));
    int year = int(msPassed / YEAR_IN_MS);
    // console.log("year: ", uint(year));

    int coinPrincipal = toCoin(user.fiatPrincipal, timeMs);
    int coinOriginal = coinBalance + user.reserved;
    // console.log("coinOriginal: ", uint(coinOriginal));
    // console.log("coinPrincipal: ", uint(coinPrincipal));

    int percentCovered = (FLOAT_FACTOR * maxFiatProtected) / user.fiatPrincipal;
    if (percentCovered > FLOAT_FACTOR) {
      percentCovered = FLOAT_FACTOR;
    }
    // console.log("percentCovered: ", uint(percentCovered));

    int maxPercentCushion = getMaxPercentCushion((1 + year) * YEAR_IN_MS);
    // console.log("maxPercentCushion: ", uint(maxPercentCushion));
    int coinMaxCushion = (maxPercentCushion * coinOriginal) / FLOAT_FACTOR;
    // console.log("coinMaxCushion: ", uint(coinMaxCushion));

    int coinCushion = coinOriginal - coinPrincipal;
    // console.log("coinCushion: ", uint(coinCushion));
    int coinCovered = coinCushion;
    if (coinCushion > coinMaxCushion) {
      coinCovered = coinMaxCushion;
    }
    int r = ((coinCovered * percentCovered) / FLOAT_FACTOR) - user.reserved;
    // console.log("r: ", uint(r));
    return r;
  }

  // Public-access for testing
  function calcCushionDown(address user, int coinBalance, uint timeMs) public view returns(int) {
    UserCushion storage userCushion = cushions[user];
    return _calcCushionDown(userCushion, coinBalance, timeMs);
  }

  function _calcCushionDown(UserCushion storage user, int coinBalance, uint timeMs) internal view returns(int) {
    if (user.fiatPrincipal == 0) {
      return 0;
    }

    int coinPrincipal = toCoin(user.fiatPrincipal, timeMs);
    int coinOriginal = coinBalance + user.reserved;
    // console.log("coinOriginal: ", uint(coinOriginal));
    // console.log("user.reserved: ", uint(user.reserved));

    int percentCovered = (maxFiatProtected * FLOAT_FACTOR) / user.fiatPrincipal;
    if (percentCovered > FLOAT_FACTOR) {
      percentCovered = FLOAT_FACTOR;
    }
    // console.log("percentCovered: ", uint(percentCovered));

    int coinCovered = user.maxCovered;
    if (coinCovered > coinPrincipal) {
      coinCovered = coinPrincipal;
    }
    // console.log("coinCovered: ", uint(coinCovered));

    int target = percentCovered * coinCovered;
    // console.log("target: ", uint(target / FLOAT_FACTOR));
    int original = (percentCovered * coinOriginal) - (user.reserved * FLOAT_FACTOR);
    // console.log("original: ", uint(original / FLOAT_FACTOR));

    return (target - original) / FLOAT_FACTOR;
  }

  function getMaxPercentCushion(int timeMs) public view returns(int) {
    return FLOAT_FACTOR - (FLOAT_FACTOR_SQ / (FLOAT_FACTOR + maxCushionUp * (timeMs / YEAR_IN_MS)));
  }
  function getAnnualizedValue(uint lastAvgAdjustTime, uint timeMs, int value) public pure returns(int) {
    if (timeMs <= lastAvgAdjustTime) return 0;
    int timeChange = FLOAT_FACTOR * int(timeMs - lastAvgAdjustTime);
    int percentOfYear = timeChange / YEAR_IN_MS;
    int annualizedAvg = value * percentOfYear;
    return annualizedAvg / FLOAT_FACTOR;
  }
  function getAvgFiatPrincipal(address user, uint timeMs) public view returns(int) {
    UserCushion storage userCushion = cushions[user];
    return userCushion.avgFiatPrincipal + this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, userCushion.fiatPrincipal);
  }
  function getAvgCoinBalance(address user, uint timeMs) public view returns(int) {
    UserCushion storage userCushion = cushions[user];
    int coinBalance = theCoin.pl_balanceOf(user);
    return userCushion.avgCoinPrincipal + this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, coinBalance);
  }

  // ------------------------------------------------------------------------
  // transactions change the principal
  // ------------------------------------------------------------------------

  function preDeposit(address user, uint coinBalance, uint coinDeposit, uint timeMs) public virtual override  {
    int fiatDeposit = toFiat(int(coinDeposit), timeMs);
    // console.log("preDeposit: ", uint(fiatDeposit));
    UserCushion storage userCushion = cushions[user];

    userCushion.avgFiatPrincipal += this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, userCushion.fiatPrincipal);
    userCushion.avgCoinPrincipal += this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, int(coinBalance));
    // console.log("userCushion.avgCoinPrincipal: ", uint(userCushion.avgCoinPrincipal));

    int depositRatio = FLOAT_FACTOR;
    if (userCushion.fiatPrincipal != 0) {
      // console.log("denominator: ", uint(userCushion.maxCovered * maxCushionDown));
      int ratioOfExisting = (FLOAT_FACTOR_SQ * int(coinDeposit)) / (userCushion.maxCovered * maxCushionDown);
      // console.log("ratioOfExisting: ", uint(ratioOfExisting));
      depositRatio = (FLOAT_FACTOR_SQ * fiatDeposit / userCushion.fiatPrincipal) / ratioOfExisting;
    }
    // console.log("depositRatio: ", uint(depositRatio));

    userCushion.fiatPrincipal += fiatDeposit;

    int maxCoverAdjust = (FLOAT_FACTOR - depositRatio) * int(coinDeposit) / (FLOAT_FACTOR - maxCushionDown);
    int maxCoverForCoin = (FLOAT_FACTOR * int(coinDeposit)) / (FLOAT_FACTOR - maxCushionDown);

    // In profit
    if (maxCoverAdjust < 0 && maxCoverForCoin > userCushion.maxCoverAdjust) {
      // If adjusting for a withdrawal on loss
      if (userCushion.maxCoverAdjust > 0) {
        userCushion.maxCovered += maxCoverForCoin - maxCoverAdjust;
        userCushion.maxCoverAdjust += maxCoverAdjust;
      }
      // Else eliminate adjustments for a withdrawal on profit
      else {
        userCushion.maxCovered += maxCoverForCoin - userCushion.maxCoverAdjust;
        userCushion.maxCoverAdjust = 0;
      }
    }
    else {
      if (maxCoverForCoin > userCushion.maxCoverAdjust) {
        int adjust = userCushion.maxCoverAdjust;
        if (adjust > maxCoverAdjust) {
          adjust = maxCoverAdjust;
        }
        maxCoverForCoin -= adjust;
        userCushion.maxCoverAdjust -= adjust;
      } else {
        userCushion.maxCoverAdjust -= maxCoverAdjust;
      }
      userCushion.maxCovered += maxCoverForCoin;
    }
    userCushion.lastAvgAdjustTime = timeMs;

    emit ValueChanged(user, timeMs, "cushions[user].fiatPrincipal", userCushion.fiatPrincipal);
    emit ValueChanged(user, timeMs, "cushions[user].maxCovered", userCushion.maxCovered);
  }

  function preWithdraw(address user, uint coinBalance, uint coinWithdraw, uint timeMs) public virtual override returns(uint) {
    UserCushion storage userCushion = cushions[user];
    int fiatWithdraw = toFiat(int(coinWithdraw), timeMs);
    // console.log("preWithdraw: ", uint(fiatWithdraw));
    int ratioOfExisting = (FLOAT_FACTOR_SQ * int(coinWithdraw)) / (userCushion.maxCovered * maxCushionDown);
    // console.log("ratioOfExisting: ", uint(ratioOfExisting));
    int withdrawRatio = (FLOAT_FACTOR_SQ * fiatWithdraw / userCushion.fiatPrincipal) / ratioOfExisting;
    // console.log("withdrawRatio: ", uint(withdrawRatio));

    if (coinBalance < coinWithdraw) {
      // In Loss, run CushionDown
      uint additionalRequired = coinWithdraw - coinBalance;
      // console.log("additionalRequired: ", additionalRequired);
      int maxCushion = _calcCushionDown(userCushion, int(coinBalance), timeMs);
      // console.log("maxCushion: ", uint(maxCushion));
      require(int(additionalRequired) <= maxCushion, "Insufficient funds");
      // transfer additionalRequired to this users account
      theCoin.pl_transferTo(user, additionalRequired, timeMs);
    }

    userCushion.avgFiatPrincipal += this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, userCushion.fiatPrincipal);
    userCushion.avgCoinPrincipal += this.getAnnualizedValue(userCushion.lastAvgAdjustTime, timeMs, int(coinBalance));
    userCushion.fiatPrincipal -= fiatWithdraw;
    userCushion.lastAvgAdjustTime = timeMs;

    userCushion.maxCoverAdjust += (FLOAT_FACTOR - withdrawRatio) * int(coinWithdraw) / (FLOAT_FACTOR - maxCushionDown);
    userCushion.maxCovered -= withdrawRatio * int(coinWithdraw) / (FLOAT_FACTOR - maxCushionDown);

    emit ValueChanged(user, timeMs, "cushions[user].fiatPrincipal", userCushion.fiatPrincipal);
    emit ValueChanged(user, timeMs, "cushions[user].maxCovered", userCushion.maxCovered);

    return coinWithdraw;
  }

  // ------------------------------------------------------------------------
  // Owners functionality
  // ------------------------------------------------------------------------
  function drawDownCushion(address user, uint timeMs) public onlyOwner() {
    _drawDownCushion(user, timeMs);
  }

  function _drawDownCushion(address user, uint timeMs) internal {
    require(timeMs < msNow(), "Time must be in the past");
    // console.log("*** drawDownCushion timeMs: ", uint(timeMs));
    int avgCoinPrincipal = this.getAvgCoinBalance(user,timeMs);
    // console.log("avgCoinPrincipal: ", uint(avgCoinPrincipal));
    int avgFiatPrincipal = this.getAvgFiatPrincipal(user, timeMs);
    // console.log("avgFiatPrincipal: ", uint(avgFiatPrincipal));

    // Prevent divide-by-zero
    if (avgCoinPrincipal == 0 || avgFiatPrincipal == 0) {
      return;
    }
    UserCushion storage userCushion = cushions[user];
    // How can we limit this to the maxiumum of the maxCushionUpPercent?
    int covered = (FLOAT_FACTOR * maxFiatProtected) / avgFiatPrincipal;
    if (covered > FLOAT_FACTOR) {
      covered = FLOAT_FACTOR;
    }
    // console.log("covered: ", uint(covered));

    // We always reserve the maximum percent, ignoring current rates
    // CushionDown ensures that this does not take balance below principal
    // console.log("userCushion.lastDrawDownTime: ", uint(userCushion.lastDrawDownTime));
    int timeSinceLastDrawDown = int(timeMs - userCushion.lastDrawDownTime);
    // console.log("timeSinceLastDrawDown: ", uint(timeSinceLastDrawDown));
    int percentCushion = this.getMaxPercentCushion(timeSinceLastDrawDown);
    // console.log("percentCushion: ", uint(percentCushion));
    // How many coins we gonna keep now?
    int toReserve = (covered * percentCushion * avgCoinPrincipal) / (FLOAT_FACTOR * FLOAT_FACTOR);
    // console.log("toReserve: ", uint(toReserve));

    // If nothing to do, do nothing
    if (toReserve == 0) {
      return;
    }

    // Transfer the reserve to this contract
    theCoin.pl_transferFrom(user, address(this), uint(toReserve), timeMs);
    userCushion.reserved += toReserve;
    userCushion.lastDrawDownTime = timeMs;
    userCushion.lastAvgAdjustTime = timeMs;

    emit ValueChanged(user, timeMs, "cushions[user].reserved", userCushion.reserved);
    emit ValueChanged(user, timeMs, "cushions[user].lastDrawDownTime", int(userCushion.lastDrawDownTime));
  }

  function withdraw(uint amount) internal onlyOwner() {
    theCoin.pl_transferFrom(address(this), owner(), amount, msNow());
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

