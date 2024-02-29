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

  function getOracle() public view returns(address) {
    return address(priceFeed);
  }

  // Convert to fiat with 2 decimal places (ie, floor to cent)
  function toFiat(int coin, uint millis) public view returns(int) {
    uint price = getPrice(millis);
    // coin is 6 decimal places, price is 8 decimal places
    // 1 coin at exchange of 4 would be 1*10e6 * 4*10e8
    // to be 4*10e14 / 10e12 to be 400 cents.
    return (coin * int(price) + 5e11) / 1e12;
  }

  function toFiat(uint coin, uint millis) public view returns(uint) {
    uint price = getPrice(millis);
    // coin is 6 decimal places, price is 8 decimal places
    // 1 coin at exchange of 4 would be 1*10e6 * 4*10e8
    // to be 4*10e14 / 10e12 to be 400 cents.
    // We add 5e11 to compensate for rounding
    return (coin * price + 5e11) / 1e12;
  }

  // convert to coin.  Fiat should be denominated in cents
  function toCoin(uint fiat, uint millis) public view returns(uint) {
    uint price = getPrice(millis);
    return (fiat * 1e12 + 5e5) / price;
  }
  function toCoin(int fiat, uint millis) public view returns(int) {
    uint price = getPrice(millis);
    return (fiat * 1e12 + 5e5) / int(price);
  }

  /**
    * Returns the latest price
    */
  function getPrice(uint millis) public view returns(uint) {
    uint price = priceFeed.getRoundFromTimestamp(millis);
    return price;
  }
}
