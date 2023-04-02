// ----------------------------------------------------------------------------
/// @title Debugging aid for plugins
/// @author StephenTaylor
/// @notice This plugin simply logs for every event
/// @dev This is a sample plugin and not intended for production
// ----------------------------------------------------------------------------

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import '@thecointech/contract-plugins/contracts/BasePlugin.sol';

contract DebugPrint is BasePlugin {

  event PrintPreWithdraw(address user, uint coin, uint timestamp);
  event PrintPreDeposit(address user, uint coin, uint timestamp);
  event PrintAttached(address user, address initiator);
  event PrintDetached(address user, address initiator);


  // We modify the users balance to reflect what they can actually spend.
  // When a withdrawal occurs we may boost the
  function getPermissions() override external pure returns(uint) {
    return 0;
  }
  function balanceOf(address /*user*/, int currentBalance) external pure override returns(int) {
    // Cannot log in a view function unfortunately,
    // so instead just return balance / 2 to prove we were called
    return currentBalance / 2;
  }
  function preWithdraw(address user, uint balance, uint coin, uint timestamp) external override returns(uint) {
    emit PrintPreWithdraw(user, coin, timestamp);
    return balance;
  }
  function preDeposit(address user, uint, uint coin, uint timestamp) external override {
    emit PrintPreDeposit(user, coin, timestamp);
  }
    function userAttached(address add, uint, address initiator) external override {
    emit PrintAttached(add, initiator);
  }
  function userDetached(address add, address initiator) external override {
    emit PrintDetached(add, initiator);
  }
}

