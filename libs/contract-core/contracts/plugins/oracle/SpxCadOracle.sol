// Simple oracle supplies current-time prices only for SPX - CAD (ie, TC to Fiat)

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import './AggregatorV3Interface.sol';
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SpxCadOracle is AggregatorV3Interface, OwnableUpgradeable {

  function initialize() public initializer {
    __Ownable_init();
  }

  uint80 currentId;
  int256 value;

  function update(int256 newValue) public onlyOwner() {
    currentId = currentId + 1;
    value = newValue;
  }


  function latestRoundData()
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (
      currentId,
      value,
      // Ignore not-useful data
      0,
      0,
      0
    );
  }

  //-- Un-interesting functions below
  function intialize() public {
    __Ownable_init();
  }

  function decimals() external pure override returns (uint8) {
    return 8;
  }

  function description() external pure override returns (string memory) {
    return "SPX/CAD";
  }

  function version() external pure override returns (uint256) {
    return 1;  // Version 0 really.
  }

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(
    uint80 /*_roundId*/
  )
    external
    pure
    override
    returns (
      uint80,
      int256,
      uint256,
      uint256,
      uint80
    )
    {
      // We currently do not do this.
      revert("No data present");
    }
}
