/// @title Freezable ability for TheCoin
/// @author Stephen Taylor
/// @notice Allows per-account freezing with timeout
/// @dev Requires inheritor to implement AccessControlEnumerable

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./Gassless.sol";

abstract contract Freezable is Gassless {

  // Freezer role
  bytes32 public constant MRFREEZE_ROLE = keccak256("MRFREEZE_ROLE");

  // An account may be subject to a timeout, during which
  // period it is forbidden from transferring its value
  mapping(address => uint) freezeUntil;

  // ------------------------------------------------------------------------
  // Sets a timeout, until which time the user will not
  // account may not be transacted against.
  // ------------------------------------------------------------------------
  function setAccountFreezeTime(address account, uint time) public
    onlyMrFreeze
  {
      freezeUntil[account] = time;
  }

  // ------------------------------------------------------------------------
  // Returns the timestamp of when this account will
  // be unfrozen (able to be transacted against)
  // ------------------------------------------------------------------------
  function accountUnfreezeTime(address account) public view returns(uint)
  {
      return freezeUntil[account];
  }

  // ------------------------------------------------------------------------
  // Modifiers
  // ------------------------------------------------------------------------
  modifier onlyMrFreeze()
  {
    require(IAccessControlUpgradeable(this).hasRole(MRFREEZE_ROLE, msg.sender), "Action requires MrFreeze role");
    _;
  }

  modifier onlyUnfrozen(address from)
  {
    require(freezeUntil[from] < block.timestamp, "From account is currently frozen");
    _;
  }
}
