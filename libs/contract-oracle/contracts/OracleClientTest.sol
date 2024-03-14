/// @title Pure testing class
/// @author Stephen Taylor

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import './OracleClient.sol';

contract OracleClientTest is OracleClient {
  function setOracle(address oracle) public {
    setFeed(oracle);
  }
}
