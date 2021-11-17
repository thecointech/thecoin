/// @title TheCoin
/// @author Stephen Taylor
/// @notice L2 version of TheCoin
/// @dev adds the ability to deposit/withdraw from L2

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./TheCoin.sol";
import "./IChildToken.sol";

//
// Polygon compatibility.
// Allows L1 <=> L2 compatibility
// Src: https://github.com/maticnetwork/pos-portal/blob/master/flat/ChildMintableERC20.sol
//
contract TheCoinL2 is TheCoin, IChildToken {

  // Depositor is the child chain manager
  bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

  function initialize(address _sender, address depositor) public initializer
  {
    TheCoin.initialize(_sender);
    _setupRole(DEPOSITOR_ROLE, depositor);
  }

  /**
  * @notice called when token is deposited on root chain
  * @dev Should be callable only by ChildChainManager
  * Should handle deposit by minting the required amount for user
  * Make sure minting is done only by this function
  * @param user user address for whom deposit is being done
  * @param depositData abi encoded amount
  */
  function deposit(address user, bytes calldata depositData)
    external
    override
    onlyRole(DEPOSITOR_ROLE)
  {
    uint256 amount = abi.decode(depositData, (uint256));
    _mint(user, amount);
  }

  /**
  * @notice called when user wants to withdraw tokens back to root chain
  * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
  * @param amount amount of tokens to withdraw
  */
  function withdraw(uint256 amount) external {
    _burn(_msgSender(), amount);
  }
}
