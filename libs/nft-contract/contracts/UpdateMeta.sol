/// @title Updatable NFT
/// @author Stephen Taylor
/// @notice Simple utils class handles updating an NFT's IPFS hash
/// @dev This class is imported by our NFT to simplify the testing etc.

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./BaseData.sol";

contract UpdateMeta is BaseData {
  using ECDSA for bytes32;

  /**
   * Reset the metadata associated with a token.  This can be done at any time, and
   * does not affect the 'lastUpdate' of a token.  This can be used (for example) to
   * remove a personal profile picture prior to public auction.
   */
  function resetMetaSha256(uint256 tokenId) external {
    // Is the sender allowed to do this allowed to do this?
    require(_isApprovedOrOwner(_msgSender(), tokenId), "Meta reset not owner");
    // IMPORTANT: A reset does not modify 'lastUpdate', and can be done at any time
    _tokenMetadata[tokenId].ipfsPrefix = defaultIpfsPrefix;
    _tokenMetadata[tokenId].ipfsHash = defaultIpfsHash;
  }

  /**
   * Update the metadata associated with a token.  A user will use this when signing an image
   * It is only legal to call this function once every 3 months.
   */
  function updateMetaSha256(uint256 tokenId, uint16 prefix, bytes32 ipfsHash) external {
    // Is the sender allowed to do this allowed to do this?
    require(_isApprovedOrOwner(_msgSender(), tokenId), "Meta update not owner");
    updateMeta(_tokenMetadata[tokenId], prefix, ipfsHash);
  }

  /**
   * Similar to updateMetaSha256, allows gassless updates to a tokens metadata.
   * The owner of the token must sign a combination of lastUpdate + id + prefix + hash.
   * We verify the signature on-chain to prove legitimacy
   * Sourcing lastUpdate onChain ensures that this fn cannot be replayed, because if
   * the function is succesfull lastUpdate will be modifed (and the signature will no longer match)
   */
  function updateMetaSha256GassLess(uint256 tokenId, uint16 prefix, bytes32 ipfsHash, bytes calldata signature) external {
    address signer = recoverSigner(tokenId, _tokenMetadata[tokenId].lastUpdate, prefix, ipfsHash, signature);
    address owner = ERC721.ownerOf(tokenId);
    require(signer == owner, "Meta signer is not owner");
    updateMeta(_tokenMetadata[tokenId], prefix, ipfsHash);
  }

  /**
   * Update token metadata, and reset lastUpdate
   */
  function updateMeta(TokenDataPacked storage token, uint16 prefix, bytes32 ipfsHash) internal {
    require(canUpdate(token), "Cannot update within 3 months of prior update");
    token.ipfsPrefix = prefix;
    token.ipfsHash = ipfsHash;
    token.lastUpdate = uint40(block.timestamp);
  }

  /**
   * Get the address who signed off on the following variables.
   */
  function recoverSigner(uint256 tokenId, uint40 ts, uint16 prefix, bytes32 ipfsHash, bytes calldata signature) internal pure returns (address)
	{
    // First, recreate the message that the client signed.
    // This packed data must match the client's data packing
		bytes memory packed = abi.encodePacked(tokenId, ts, prefix, ipfsHash);
    // Take the hash of the packed data.
		return keccak256(packed)
      .toEthSignedMessageHash()
      .recover(signature);
	}

}
