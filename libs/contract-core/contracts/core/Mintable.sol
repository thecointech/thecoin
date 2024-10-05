/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./ExactDateable.sol";

abstract contract Mintable is ExactDateable {

  // The Minter is permitted to mint/melt coins.
  // All coins minted/melted by the minter are
  // from/to  address
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // ------------------------------------------------------------------------
  // Total supply management
  // ------------------------------------------------------------------------

  // The owner will periodically add new coins to match
  // shares purchased in SPX.
  // NOTE: Timestamp is in millis
  function mintCoins(uint amount, address to, uint timestamp) public
    onlyMinter
  {
    // We can only mint coins to the TC address
    require(hasRole(THECOIN_ROLE, to), "Action requires TheCoin role");
    _mint(to, amount);
    emit ExactTransfer(address(0), to, amount, timestamp);
  }

  // Remove coins.  Only TheCoin may burn coins
  // NOTE: Timestamp is in millis
  function burnCoins(uint amount, uint timestamp) public
    onlyTheCoin
  {
    _burn(_msgSender(), amount);
    emit ExactTransfer(_msgSender(), address(0), amount, timestamp);
  }

  // Coins currently owned by end-users
  function coinsCirculating() public view returns(uint)
  {
      return totalSupply() - reservedCoins();
  }

  // Coins held by TC in reserve.  This includes both
  // root TC account and brokers.
  function reservedCoins() public view returns (uint reserved)
  {
    for (uint i = 0; i < getRoleMemberCount(MINTER_ROLE); i++) {
      reserved += balanceOf(getRoleMember(THECOIN_ROLE, i));
    }
    for (uint i = 0; i < getRoleMemberCount(BROKER_ROLE); i++) {
      reserved += balanceOf(getRoleMember(BROKER_ROLE, i));
    }
    reserved;
  }

  modifier onlyMinter()
  {
    require(hasRole(MINTER_ROLE, _msgSender()), "Action requires Minter role");
    _;
  }

  // Declare virtual functions needed to be implemented later
}
