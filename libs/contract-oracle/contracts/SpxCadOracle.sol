// Simple oracle supplies current-time prices only for SPX - CAD (ie, TC to Fiat)
// It will be updated every 3 hours from now into eternity

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import './AggregatorV3Interface.sol';
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * The online pricing oracle for SPX/CAD.
 * This interface loosely matches the Chainlink AggregatorV3Interface,
 * but is primarily intended to be used with TheCoin.
*/
contract SpxCadOracle is AggregatorV3Interface, OwnableUpgradeable, AccessControlUpgradeable {

  // OracleUpdater.  This is the only address allowed
  // to update the oracle price.
  bytes32 public constant UPDATER_ROLE = DEFAULT_ADMIN_ROLE;

  // We store a single multiplier that converts from THE => CAD (ie, TC to Fiat)
  // for each 3-hour block since inception.
  // NOTE: This is tightly packed, but usage could be improved dramatically
  // Perhaps we should drop to an uint32 instead
  uint64[] rates;
  // The timestamp (in millis) rates[0] starts at.  Is (should be) immutable
  int public INITIAL_TIMESTAMP;
  // Each rates entry is value for 3 hours
  int public BLOCK_TIME;

  // Our blocks are synced with NY time.  This means we must
  // compensate for daylight saving time.  This structure records
  // from when an offset takes effect, and how much is offset in seconds.
  // These offsets shorten/lengthen the length of time
  // a given rate will be effective for.
  // NOTE! These offsets are read very frequently,
  // but written 2x per year, do not optimize for space
  struct MilliSecondsOffset {
    // When this offset takes effect
    int from;
    // How many milliseconds to offset this block for.
    int offset;
  }
  // All historical offsets from then until now.
  MilliSecondsOffset[] offsets;

  function initialize(address updater, int initialTimestamp, int blockTime) public initializer {
    __Ownable_init();
    __AccessControl_init();
    _setupRole(UPDATER_ROLE, updater);

    INITIAL_TIMESTAMP = initialTimestamp;
    BLOCK_TIME = blockTime;
  }

  // Our initialize is limited in how many values can be sent.  This
  // is because the gas limits are too low to allow storing all prior values.
  function bulkUpdate(uint64[] calldata newValues) public onlyUpdater() {
    // TODO: http://zxstudio.org/blog/2018/09/11/effectively-storing-arrays-in-solidity/

    // check that there aren't too many new values...
    uint pushValidUntil = validUntil() + (newValues.length * uint(BLOCK_TIME));
    uint maxValidUntil = msNow() + uint(BLOCK_TIME);
    require(pushValidUntil <= maxValidUntil, "Too many updates");
    for (uint i = 0; i < newValues.length; i++) {
      rates.push(newValues[i]);
    }
  }

  function clearAllData() public onlyUpdater{
    delete rates;
    delete offsets;
  }

  function getRates() public view returns (uint64[] memory) { return rates; }

  function msNow() public view returns(uint) { return block.timestamp * 1000; }

  //
  // Add a new rate to the end of the list.
  function update(uint64 newValue) public onlyUpdater() {
    uint millis = msNow();
    int offset = getOffset(millis);
    // Only update the value if our current value is near expiry
    int currentExpires = offset + INITIAL_TIMESTAMP + (int(rates.length) * BLOCK_TIME);
    // We allow updates to happen only after 2 min prior to expiry
    // This is to prevent multiple updates from happening
    require((currentExpires - 120) < int(millis), "Cannot set new value before prior expires");

    rates.push(newValue);
  }

  //
  // update our time offset.
  function updateOffset(MilliSecondsOffset calldata offset) public onlyUpdater() {
    offsets.push(offset);
  }

  //
  // Return's the last applied offset
  function lastOffsetFrom() public view returns (int) {
    if (offsets.length == 0) return 0;
    return offsets[offsets.length - 1].from;
  }

  //
  // Get the timestamp our current block is valid until
  function validUntil() public view returns (uint) {
    int offset = getOffset(msNow());
    return uint(offset + INITIAL_TIMESTAMP + (int(rates.length) * BLOCK_TIME));
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
      int(uint(rates[roundId])),
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
      int(uint(rates[rates.length - 1])),
      // Ignore not-useful data
      0,
      0,
      0
    );
  }

  function getRoundFromTimestamp(uint millis)
    external
    view
    override
    returns (uint answer)
  {
    require(int(millis) >= INITIAL_TIMESTAMP, "Timestamp before oracle inception");
    uint blockIdx = getBlockIndexFor(millis);
    require(blockIdx < rates.length, "Timestamp not yet valid");
    return rates[blockIdx];
  }

  // Get the time offset for the given timestamp.
  function getBlockIndexFor(uint millis) public view returns (uint blockIdx) {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    int offset = getOffset(millis);
    // NOTE: Solidity will throw on underflow here.
    int searchTime = int(millis) - INITIAL_TIMESTAMP - offset;
    return uint(searchTime / BLOCK_TIME);
  }
  // Get the time offset for the given timestamp.
  function getOffset(uint millis) public view returns (int offset) {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    for (int i = int(offsets.length) - 1; i >= 0; i--) {
      if (offsets[uint(i)].from < int(millis)) {
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

  modifier onlyUpdater()
  {
    require(hasRole(UPDATER_ROLE, _msgSender()), "Action requires Updater role");
    _;
  }
}
