/// @title Exploratory version of BalanceGuard
/// @author Stephen Taylor
/// @notice A plugin to protect a users balance in case of a market drop.
/// This plugin acts similar to insurance by spreading risk, however instead
/// of sharing over a population who will all experience the same thing at
/// same time, we spread the risk primarily over time by capturing a small
/// part of the clients profit.
/// @dev This is intended more to test the plugin integration than a working version

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import '@thecointech/contract-oracle/contracts/OracleClient.sol';
import '../BasePlugin.sol';
import '../permissions.sol';
import '../IPluggable.sol';


// ----------------------------------------------------------------------------
// TheCoin plugin
// This contract is the alpha version of BalanceGuard,
// A plugin to protect a users balance in case of a market drop.
// This plugin acts similar to insurance by spreading risk, however instead
// of sharing over a population who will all experience the same thing at
// same time, we spread the risk primarily over time by capturing a small
// part of the clients profit.
//
// V0 is limited to 10% guard, 2% cost
// ----------------------------------------------------------------------------

struct UserData {
  // The amount of the users balance that we protect.
  // Equates (loosely) to cost basis
  // int64 for cents means a max value of approx $92 trillion
  // This can be negative, if the user has gained profit then
  // withdrawn it all
  int costBasis;

  // The last time we updated the reserved amount.
  uint lastUpdate;

  // How much of the users balance have we reserved for insurance?
  // This is updated once per year, and effectively locks up part
  // of the users account.
  uint reserved;
}

contract BalanceGuardV0 is BasePlugin, OracleClient, Ownable, PermissionUser {

  mapping(address => UserData) userFiatBalance;

  // Link back to core contract.
  IPluggable internal theCoin;

  constructor(address baseContract, address oracle)
  {
    setFeed(oracle);
    theCoin = IPluggable(baseContract);
  }

  // We modify the users balance to reflect what they can actually spend.
  // When a withdrawal occurs we may boost the
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_BALANCE & PERMISSION_WITHDRAWAL;
  }

    // If this is a new user, we initialize the guard to their fiat amount.
  function userAttached(address newUser, uint /*timeMs*/, address initiator) override external onlyOwner {
    require(owner() == initiator, "FIXME! only tcCore should be able to call this, no?  only owner may attach this plugin");
    // only initialize if new user.
    if (userFiatBalance[newUser].costBasis == 0) {
      int currentBalance = theCoin.pl_balanceOf(newUser);
      int costBasis = toFiat(currentBalance, msNow());
      userFiatBalance[newUser].costBasis = int(costBasis);
    }
  }

  // When a user removes this plugin, we clear any balance owing.
  function userDetached(address exClient, address initiator) override external onlyOwner {
    require(owner() == initiator, "only owner may detach this plugin");
    theCoin.pl_transferFrom(exClient, address(this), userFiatBalance[exClient].reserved, msNow());
    delete userFiatBalance[exClient];
  }

  // We automatically modify the balance to adjust for market fluctuations.
  function balanceOf(address user, int currentBalance) external view override returns(int)
  {
    // We work directly in coin for this function
    int fxAdjBalance = toCoin(userFiatBalance[user].costBasis, msNow());
    if (currentBalance > fxAdjBalance) {
      // users account has grown.  Subtract up to 2% growth
      int twoPercent = fxAdjBalance / 50;
      int adjBalance = currentBalance - twoPercent;
      return adjBalance > fxAdjBalance ? adjBalance : fxAdjBalance;
      // return Math.max(currentBalance - twoPercent, fxAdjBalance);
    }

    else if (int(currentBalance) < fxAdjBalance) {
      // If the users balance has gone down in fiat, add up to 10% to ease the blow
      // For example, if you bought 1000 coin @ $2, we protect the first
      // $200 of drop by transfering in 111.1 coin at $1.80, but after that
      // the drop happens at market rates.  (100 / 9 == 11.1111)

      // NOTE - this is clearly wrong because it does not maintain
      // state, and only accounts for this single tx[]
      int tenPercent = currentBalance / 9;
      int adjBalance = currentBalance + tenPercent;
      return adjBalance < fxAdjBalance ? adjBalance : fxAdjBalance;
      // return Math.min(currentBalance + tenPercent, fxAdjBalance);
    }
    return currentBalance;
  }

  //
  // On deposit we update the users current balance
  function preDeposit(address user, uint /*balance*/, uint coin, uint timestamp) external override onlyOwner {
    // Update users ACB
    uint fiat = toFiat(coin, timestamp);
    userFiatBalance[user].costBasis += int(fiat);
  }

  function preWithdraw(address user, uint balance, uint coin, uint timestamp) external override onlyOwner returns(uint) {
    int fiat = toFiat(int(coin), timestamp);
    // We may need to transfer some coin into the users account.
    // This only is necessary if the user doesn't have coin to cover it,
    // and the total amount is between 90 & 100%
    // NOTE - this is also clearly wrong, but good enough to test plugin system
    if (coin > balance) {
      int ninetyPercent = userFiatBalance[user].costBasis * 90 / 100;
      if (fiat > ninetyPercent) {
        uint missingCoin = coin - balance;
        theCoin.pl_transferTo(user, missingCoin, timestamp);
        balance = coin;
      }
    }

    // NOTE: we never do the withdrawal to avoid incurring cap gains tax.

    // Adjust the CB.  This can go negative if the user gains profits
    // then spends more than ACB.  It is important we remember this
    userFiatBalance[user].costBasis -= int(fiat);
    return balance;
  }
}

