// ----------------------------------------------------------------------------
/// @title RoundNumber demo plugin
/// @author Stephen Taylor
/// @notice A simple plugin intended to test plugin funtionality.
/// Rounds the users balance down to the nearest $100 in fiat
/// @dev This is a sample plugin and not intended for production
// ----------------------------------------------------------------------------

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import '@thecointech/contract-plugins/contracts/BasePlugin.sol';
import '@thecointech/contract-plugins/contracts/permissions.sol';
import '@thecointech/contract-oracle/contracts/OracleClient.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract RoundNumber is BasePlugin, OracleClient, Ownable, PermissionUser {

  constructor(address oracle) {
    setFeed(oracle);
  }

  // Round to the nearest $100 (10K cents)
  int DEFAULT_ROUND_POINT = 10000;

  // Users can specify their own rounding point
  mapping(address => int) UserRounding;

  // We modify the users balance to reflect what they can actually spend.
  // When a withdrawal occurs we may boost the
  function getPermissions() override external pure returns(uint) {
    return PERMISSION_BALANCE;
  }

  function setRoundPoint(int newRoundPoint, uint timestamp) public {
    UserRounding[msg.sender] = newRoundPoint;
    emit ValueChanged(msg.sender, timestamp, "UserRounding[user]", newRoundPoint);
  }

  function balanceOf(address user, int currentBalance) external view override returns(int){
    // Fiat is in cents
    int fiat = toFiat(currentBalance, block.timestamp);
    int roundPoint = UserRounding[user];
    if(roundPoint == 0) {
      roundPoint = DEFAULT_ROUND_POINT;
    }
    int rounded = (fiat / roundPoint) * roundPoint;
    return toCoin(rounded, block.timestamp);
  }
}

