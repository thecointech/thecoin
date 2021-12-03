/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./Base.sol";

abstract contract ExactDateable is Base {

  // Brokers are allowed to timestamp their transactions
  bytes32 public constant BROKER_ROLE = keccak256("BROKER_ROLE");

  // We record the exact timestamp a transaction was initiated
  // to ensure our tracking is precise (for tax etc).
  // NOTE: timestamp here is in millis (not seconds)
  event ExactTransfer(address indexed from, address indexed to, uint amount, uint timestamp);

  // Allow specifying exact timestamp.  This is to allow specifying the timestamp for purchase/sale
  function exactTransfer(address to, uint amount, uint256 timestamp) virtual public onlyBroker {
    _transfer(_msgSender(), to, amount);
    emit ExactTransfer(_msgSender(), to, amount, timestamp);
  }

  modifier onlyBroker()
  {
    require(hasRole(BROKER_ROLE, _msgSender()), "Action requires Broker role");
    _;
  }
}
