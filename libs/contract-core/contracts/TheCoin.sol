/// @title TheCoin: Future-proof currency
/// @author Stephen Taylor
/// @notice TheCoin is a stablecoin, backed by the S&P500 and designed as a day-to-day currency.
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import './core/Pluggable.sol';

// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals
//
// NOTE: 100 these is equivalent to 1 share of SPX,
// or *at time of writing* roughly $2.70 USD
// and with 6 decimal places 100,000,000 tokens is 1 share,
// and 1 token has an approximate value of 0.00027c USD
// ----------------------------------------------------------------------------
contract TheCoin is Pluggable {

  // ------------------------------------------------------------------------
  // Constructor
  // ------------------------------------------------------------------------
  function initialize(address sender) public initializer
  {
    __ERC20_init("TheCoin", "THE");
    __AccessControl_init();

    // We only setup the default role here
    _setupRole(THECOIN_ROLE, sender);
    _setupRole(BROKER_ROLE, sender);
  }

  function decimals() public view virtual override returns (uint8) {
    return 6;
  }

  // ------------------------------------------------------------------------
  // Clone function is used to clone existing txs on initialization
  // It can (and should) be removed after intialization
  // ------------------------------------------------------------------------
  function runCloneTransfer(address from, address to, uint amount, uint fee, uint timestamp) public onlyTheCoin {
    // Simple check to ensure this only occurs on new accounts
    // This function should be removed once the system is active
    require(lastTxTimestamp[from] == 0, "Cannot clone transfer on active account");
    _transfer(from, to, amount);
    if (fee > 0) {
      _transfer(from, msg.sender, fee);
    }
    emit ExactTransfer(from, to, amount, timestamp);
  }

  // ------------------------------------------------------------------------
  // Don't accept ETH
  // ------------------------------------------------------------------------
  fallback () external {
      revert("This contract does not run on Ether");
  }

  // ------------------------------------------------------------------------
  // Owner can transfer out any ERC20 tokens accidentally assigned to this contracts address
  // ------------------------------------------------------------------------
  function transferAnyERC20Token(address tokenAddress, uint256 tokens) public onlyTheCoin returns (bool success) {
      IERC20Upgradeable tokenContract = IERC20Upgradeable(tokenAddress);
      return tokenContract.transfer(msg.sender, tokens);
  }
}
