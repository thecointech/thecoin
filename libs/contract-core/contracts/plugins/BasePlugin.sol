/**
 * De-duplicate implementation of supportsInterface
*/

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./IPlugin.sol";

abstract contract BasePlugin is IPlugin {

  bytes4 public constant IID_PLUGIN = type(IPlugin).interfaceId;
  bytes4 public constant IID_ERC165 = type(IPlugin).interfaceId;

  // suppport ERC165
  function supportsInterface(bytes4 interfaceID) override external pure returns (bool)
  {
    return (
      interfaceID == IID_ERC165 || interfaceID == IID_PLUGIN
    );
  }

  // Default empty implementations allow clients to ignore fns they dont use
  function userAttached(address, address) virtual external override {}
  function userDetached(address, address) virtual external override {}
  function preDeposit(address, uint) virtual external override {}
  function preWithdraw(address, uint) virtual external override {}
  function balanceOf(address, uint currentBalance) virtual external view override returns(uint)
  { return currentBalance; }
}
