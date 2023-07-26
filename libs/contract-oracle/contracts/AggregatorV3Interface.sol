// SPDX-License-Identifier: MIT
// src: https://raw.githubusercontent.com/smartcontractkit/chainlink/master/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
// Interface matching chainlink oracles
// Ideally, we'll retire ours and support chainlinks version when it comes around.

pragma solidity ^0.8.0;

interface AggregatorV3Interface {

  function decimals()
    external
    view
    returns (
      uint8
    );

  function description()
    external
    view
    returns (
      string memory
    );

  function version()
    external
    view
    returns (
      uint256
    );

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(
    uint80 _roundId
  )
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  // Custom TC function.  Only the Oracle can convert from
  // timestamp to roundId, so we might as well encapsulate it here.
  function getRoundFromTimestamp(uint millis)
    external
    view
    returns (uint answer);
}
