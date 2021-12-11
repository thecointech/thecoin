/// @title TheCoin
/// @author Stephen Taylor
/// @notice L1 version of TheCoin
/// @dev adds the ability to deposit/withdraw from L2

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./TheCoin.sol";
import "./interfaces/IMintableERC20.sol";
//
// Polygon compatibility.
// Allows L1 <=> L2 compatibility
// Src: https://github.com/maticnetwork/pos-portal/blob/master/flat/DummyMintableERC20.sol
//
contract TheCoinL1 is TheCoin, IMintableERC20 {

  // Predicate can mint our tokens
  bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");

  function initialize(address _sender, address predicate) public initializer
  {
    TheCoin.initialize(_sender);
    _setupRole(PREDICATE_ROLE, predicate);
  }

  /**
    * @dev See {IMintableERC20-mint}.
    */
  function mint(address user, uint256 amount) external override onlyRole(PREDICATE_ROLE) {
    _mint(user, amount);
  }
}
