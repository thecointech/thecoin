/**
 * De-duplicate implementation of supportsInterface
*/

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./IPlugin.sol";

abstract contract BasePlugin is IPlugin {

  bytes4 public constant IID_PLUGIN = type(IPlugin).interfaceId;
  bytes4 public constant IID_ERC165 = type(IPlugin).interfaceId;

  event ValueChanged(address indexed user, uint msTime, string path, int change);

  // suppport ERC165
  function supportsInterface(bytes4 interfaceID) override external pure returns (bool)
  {
    return (
      interfaceID == IID_ERC165 || interfaceID == IID_PLUGIN
    );
  }

  function msNow() public view returns(uint) { return block.timestamp * 1000; }

  // Default empty implementations allow clients to ignore fns they dont use
  function userAttached(address user, uint, address) virtual external override {}
  function userDetached(address user, address) virtual external override {}
  function preDeposit(address, uint, uint, uint) virtual external override {}
  function preWithdraw(address, uint balance, uint, uint) virtual external override returns(uint)
  { return balance; }
  function balanceOf(address, int currentBalance) virtual external view override returns(int)
  { return currentBalance; }
  function modifyTransfer(address, address, uint amount, uint16 currency, uint, uint) virtual external override returns (uint, uint16)
  { return (amount, currency); }
}
