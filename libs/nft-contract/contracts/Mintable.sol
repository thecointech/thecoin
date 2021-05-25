/// @title Claim-able
/// @author Stephen Taylor
/// @notice Simple utils class handles generating a URI for IPFS content from our raw storage
/// @dev This class is imported by our NFT to simplify the testing etc.

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./BaseData.sol";

contract Mintable is BaseData {
  using ECDSA for bytes32;

  // Create a new role identifier for the minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  /**
    Assign the minter role
  */
  constructor(address minter) {
      _setupRole(MINTER_ROLE, minter);
  }

   /**
   * Mint a whole lotta tokens at once.  Cheaper than individual minting calls
   */
  function bulkMinting(uint256[] calldata ids, uint16 year) external onlyRole(MINTER_ROLE) {
    for (uint i = 0; i < ids.length; i++) {
      require(ids[i] < tokenSupply, "Invalid ID supplied");
      // Create the token
      _safeMint(_msgSender(), ids[i], "");
      // Store the token metadata
      _tokenMetadata[ids[i]].validFrom = year;
      _tokenMetadata[ids[i]].ipfsHash = defaultIpfsHash;
      _tokenMetadata[ids[i]].ipfsPrefix = defaultIpfsPrefix;
    }
  }

  /**
   * Update the metadata associated with a token.  A user will use this when signing an image
   * It is only legal to call this function once every 3 months.
   */
  function claimToken(uint256 tokenId, address claimant, bytes calldata signature) external {
    // First, get the signer
    address signer = recoverClaimSigner(tokenId, signature);
    // Was a legitimate owner of this token?
    require(hasRole(MINTER_ROLE, signer), "Claim invalid, unknown signer");
    require(ownerOf(tokenId) == signer, "Claim invalid, token already owned");
    require(_tokenMetadata[tokenId].lastUpdate == 0, "Claim invalid, token previously owned");
    _safeTransfer(signer, claimant, tokenId, "");
  }

  /**
   * Get the address who signed off on the following variables.
   */
  function recoverClaimSigner(uint256 tokenId, bytes calldata signature) public pure returns (address)
	{
    // First, recreate the message that the client signed.
    // This packed data must match the client's data packing
		bytes memory packed = abi.encodePacked(tokenId);
    // Take the hash of the packed data.
		return keccak256(packed)
      .toEthSignedMessageHash()
      .recover(signature);
	}
}
