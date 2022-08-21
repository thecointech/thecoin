/// @title Oracle client library
/// @author Stephen Taylor
/// @notice Simple library intended to add fiat conversion to plugins
/// @dev Makes it easier to convert from TC to fiat on-chain

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;
import './AggregatorV3Interface.sol';

contract OracleClient {

  // SPX->CAD price feed.  Updated irregularily.
  // Only valuable for use with TheCoin
  AggregatorV3Interface internal priceFeed;

  function setFeed(address oracle) internal {
    priceFeed = AggregatorV3Interface(oracle);
  }

  // Convert to fiat with 2 decimal places (ie, floor to cent)
  function toFiat(uint coin, uint timestamp) public view returns(int64) { return toFiat(int(coin), timestamp); }
  function toFiat(int coin, uint timestamp) public view returns(int64) {
    int price = getLatestPrice(timestamp);
    // coin is 6 decimal places, price is 8 decimal places
    // 1 coin at exchange of 4 would be 1*10e6 * 4*10e8
    // to be 4*10e14 / 10e12 to be 400 cents.
    return int64(coin * price / 10e12);
  }

  // convert to coin.  Fiat should be denominated in cents
  function toCoin(int64 fiat, uint timestamp) public view returns(int) {
    int price = getLatestPrice(timestamp);
    return int(fiat) * 10e12 / price;
  }

  /**
    * Returns the latest price
    */
  function getLatestPrice(uint /*timestamp*/) public view returns(int) {
    (
        , /*roundID*/
        int price,
        , /*startedAt*/
        , /*timeStamp*/
          /*answeredInRound*/
    ) = priceFeed.latestRoundData();
    // This value is always positive
    return price;
  }
}
