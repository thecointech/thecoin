/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

abstract contract Base is ERC20Upgradeable, AccessControlEnumerableUpgradeable {

  // THE Coin reserve address.  This is the address
  // directly managed by the THE Coin Inc.  Brokers
  // interact with this address when purchase/redeem coins
  bytes32 public constant THECOIN_ROLE = DEFAULT_ADMIN_ROLE;

  modifier onlyTheCoin()
  {
    require(hasRole(THECOIN_ROLE, _msgSender()), "Action requires TheCoin role");
    _;
  }
}
