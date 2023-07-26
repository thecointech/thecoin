// ----------------------------------------------------------------------------
/// @title SpendingLimit sample plugin
/// @author StephenTaylor
/// @notice This sample plugin demonstrates a simple way to limit a users spend
/// to a certain amount per time period.
/// @dev This is a sample plugin and not intended for production
// ----------------------------------------------------------------------------

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import '../BasePlugin.sol';
import '../permissions.sol';
import '@thecointech/contract-oracle/contracts/OracleClient.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

struct UserData {
  // How much are we allowed to spend?
  uint fiatLimit;

  // The amount spent in fiat since this period started
  uint fiatSpent;

  // The amount of the users balance that we protect.
  // Equates (loosely) to cost basis
  // uint32 for cents means a max value of approx $21 million
  uint periodStart;
}

uint constant ONE_WEEK = 604800;

contract SpendingLimit is BasePlugin, OracleClient, Ownable, PermissionUser {

  mapping(address => UserData) userData;

  uint periodLength = ONE_WEEK;

  constructor(address oracle) {
    setFeed(oracle);
  }

  // fill-in function allows owner to set user limit.  To be replaced
  // with user-signed version of the same.
  function setUserSpendingLimit(address user, uint limit) public onlyOwner {
    UserData storage data = userData[user];
    require(data.periodStart != 0, "SpendingLimit: Cannot set limit for unused client");
    data.fiatLimit = limit;
  }

  // We modify the users balance to reflect what they can actually spend.
  // When a withdrawal occurs we may boost the
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_APPROVAL;
  }

    // If this is a new user, we initialize the guard to their fiat amount.
  function userAttached(address newUser, uint timeMs, address initiator) override external {
    require(owner() == initiator, "only owner may attach this plugin");
    // only initialize if new user.
    if (userData[newUser].periodStart == 0) {
      userData[newUser].periodStart = timeMs;
    }
  }

  // When a user removes this plugin, we clear any balance owing.
  function userDetached(address exClient, address initiator) override external {
    require(owner() == initiator, "only owner may detach this plugin");
    delete userData[exClient];
  }

  function preWithdraw(address user, uint balance, uint coin, uint timestamp) external override returns(uint){
    uint fiat = toFiat(coin, timestamp);

    UserData storage data = userData[user];
    if (data.periodStart + periodLength < msNow()) {
      // Reset spending limit
      data.fiatSpent = 0;
      // Reset to the new period start time.  Because this is a floor, it should
      // always end up with the most recent period start
      uint periods = ((msNow()) - data.periodStart) / periodLength;
      data.periodStart += periods * periodLength;
    }
    // Limit spending
    require(data.fiatSpent + fiat < data.fiatLimit, "fiat limit exceeded");
    data.fiatSpent += fiat;
    return balance;
  }
}

