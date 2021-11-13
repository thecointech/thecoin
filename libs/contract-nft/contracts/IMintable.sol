/// @title IPFS Uri Generator
/// @author Stephen Taylor
/// @notice Simple utils class handles generating a URI for IPFS content from our raw storage
/// @dev This class is imported by our NFT to simplify the testing etc.

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

/** Interface for final implementations to use */
interface IMintable {
  function bulkMinting(uint256[] calldata ids, uint16 year) external;
  function claimToken(uint256 tokenId, address claimant, bytes calldata signature) external;
}
