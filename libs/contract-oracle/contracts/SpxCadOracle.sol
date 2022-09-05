// Simple oracle supplies current-time prices only for SPX - CAD (ie, TC to Fiat)

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import './AggregatorV3Interface.sol';
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * The online pricing oracle for SPX/CAD.
 * This interface loosely matches the Chainlink AggregatorV3Interface,
 * but is primarily intended to be used with TheCoin.
*/
contract SpxCadOracle is AggregatorV3Interface, OwnableUpgradeable {

  // We store a single multiplier that converts from THE => CAD (ie, TC to Fiat)
  // for each 3-hour block since inception.
  int256[] rates;
  // The timestamp rates[0] starts at.  Is (should be) immutable
  int256 public INITIAL_TIMESTAMP;
  // Each rates entry is value for 3 hours
  int256 public BLOCK_TIME;

  // Our blocks are synced with NY time.  This means we must
  // compensate for daylight saving time.  This structure records
  // from when an offset takes effect, and how much is offset in seconds.
  // These offsets shorten/lengthen the length of time
  // a given rate will be effective for.
  struct SecondsOffset {
    // When this offset takes effect
    int128 from;
    // How many seconds to offset this block for.
    int128 offset;
  }
  // All historical offsets from then until now.
  SecondsOffset[] offsets;

  function initialize(int initialTimestamp, int blockTime) public initializer {
    __Ownable_init();

    INITIAL_TIMESTAMP = initialTimestamp;
    BLOCK_TIME = blockTime;
  }

  // Our initialize is limited in how many values can be sent.  This
  // is because the gas limits are too low to allow storing all prior values.
  function bulkUpdate(int256[] calldata newValues) public onlyOwner() {
    for (uint i = 0; i < newValues.length; i++) {
      rates.push(newValues[i]);
    }
  }

  //
  // Add a new rate to the end of the list.
  function update(int256 newValue) public onlyOwner() {
    int128 offset = getOffset(int(block.timestamp));
    // Only update the value if our current value is near expiry
    int currentExpires = offset + INITIAL_TIMESTAMP + (int(rates.length) * BLOCK_TIME);
    // We allow updates to happen only after 1 min prior to expiry
    // This is to prevent multiple updates from happening
    if (currentExpires - 60 > int(block.timestamp)) {
      return;
    }
    rates.push(newValue);
  }

  //
  // update our time offset.
  function updateOffset(SecondsOffset calldata offset) public onlyOwner() {
    offsets.push(offset);
  }

  //
  // Get the timestamp our current block is valid until
  function validUntil() public view returns (int) {
    int128 offset = getOffset(int(block.timestamp));
    return offset + INITIAL_TIMESTAMP + (int(rates.length) * BLOCK_TIME);
  }

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(uint80 roundId)
    external
    view
    override
    returns (
      uint80,
      int256,
      uint256,
      uint256,
      uint80
    )
  {
    if (roundId > rates.length) {
      revert("No data present");
    }
    return (
      roundId,
      rates[roundId],
      // Ignore not-useful data
      0,
      0,
      0
    );
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
      uint80(rates.length),
      rates[rates.length - 1],
      // Ignore not-useful data
      0,
      0,
      0
    );
  }

  function getRoundFromTimestamp(int timestamp)
    external
    view
    override
    returns (int256 answer)
  {
    require(timestamp >= INITIAL_TIMESTAMP, "Timestamp before oracle inception");
    uint blockIdx = getBlockIndexFor(timestamp);
    return rates[blockIdx];
  }

  // Get the time offset for the given timestamp.
  function getBlockIndexFor(int timestamp) public view returns (uint blockIdx) {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    int128 offset = getOffset(timestamp);
    return uint((timestamp - INITIAL_TIMESTAMP - offset) / BLOCK_TIME);
  }
  // Get the time offset for the given timestamp.
  function getOffset(int timestamp) public view returns (int128 offset) {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    for (int i = int(offsets.length) - 1; i >= 0; i--) {
      if (offsets[uint(i)].from < timestamp) {
        return offsets[uint(i)].offset;
      }
    }
    return 0;
  }

  //-- Un-interesting functions below

  function decimals() external pure override returns (uint8) {
    return 8;
  }

  function description() external pure override returns (string memory) {
    return "SPX/CAD";
  }

  function version() external pure override returns (uint256) {
    return 1;  // Version 0 really.
  }
}
