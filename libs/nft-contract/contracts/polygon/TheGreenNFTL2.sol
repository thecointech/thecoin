/// @title IPFS Uri Generator
/// @author Stephen Taylor
/// @notice Simple utils class handles generating a URI for IPFS content from our raw storage
/// @dev This class is imported by our NFT to simplify the testing etc.

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../TheGreenNFT.sol";
import "../IMintable.sol";

//
// Polygon compatibility.
// Allows L1 <=> L2 compatibility
// Src: https://github.com/maticnetwork/pos-portal/blob/master/flat/ChildMintableERC721.sol
//
contract TheGreenNFTL2 is TheGreenNFT, IMintable {

  // Depositor is the child chain manager
  bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

  //
  // Mapping of tokens that have been sent to L1
  mapping (uint256 => bool) public withdrawnTokens;

  // limit batching of tokens due to gas limit restrictions
  uint256 public constant BATCH_LIMIT = 20;

  event WithdrawnBatch(address indexed user, uint256[] tokenIds);
  event TransferWithMetadata(address indexed from, address indexed to, uint256 indexed tokenId, bytes metaData);

  /** Basic setup & access control patterns */
  constructor(
    address minter,
    address depositor
  ) TheGreenNFT(minter) {
    _setupRole(DEPOSITOR_ROLE, depositor);
  }

  /**
      * @notice called when token is deposited on root chain
      * @dev Should be callable only by ChildChainManager
      * Should handle deposit by minting the required token for user
      * Should set `withdrawnTokens` mapping to `false` for the tokenId being deposited
      * Minting can also be done by other functions
      * @param user user address for whom deposit is being done
      * @param depositData abi encoded tokenIds. Batch deposit also supported.
      */
  function deposit(address user, bytes calldata depositData) external onlyRole(DEPOSITOR_ROLE)
  {
    // We send through the full packed data of the token
    (uint256 tokenId, TokenDataPacked memory tokenData) = abi.decode(depositData, (uint256, TokenDataPacked));
    require(tokenId < tokenSupply, "Invalid ID supplied");
    // Create the token
    _safeMint(user, tokenId, "");
    // Assign data
    _tokenMetadata[tokenId] = tokenData;
  }

  /**
  * @notice called when user wants to withdraw token back to root chain
  * @dev Should handle withraw by burning user's token.
  * Should set `withdrawnTokens` mapping to `true` for the tokenId being withdrawn
  * This transaction will be verified when exiting on root chain
  * @param tokenId tokenId to withdraw
  */
  function withdraw(uint256 tokenId) external {
      require(_msgSender() == ownerOf(tokenId), "ChildMintableERC721: INVALID_TOKEN_OWNER");
      withdrawnTokens[tokenId] = true;
      _burn(tokenId);
  }


  /**
      * @notice called when user wants to withdraw multiple tokens back to root chain
      * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
      * @param tokenIds tokenId list to withdraw
      */
  function withdrawBatch(uint256[] calldata tokenIds) external {

      uint256 length = tokenIds.length;
      require(length <= BATCH_LIMIT, "ChildMintableERC721: EXCEEDS_BATCH_LIMIT");

      // Iteratively burn ERC721 tokens, for performing
      // batch withdraw
      for (uint256 i; i < length; i++) {

          uint256 tokenId = tokenIds[i];

          require(_msgSender() == ownerOf(tokenId), string(abi.encodePacked("ChildMintableERC721: INVALID_TOKEN_OWNER ", tokenId)));
          withdrawnTokens[tokenId] = true;
          _burn(tokenId);

      }

      // At last emit this event, which will be used
      // in MintableERC721 predicate contract on L1
      // while verifying burn proof
      emit WithdrawnBatch(_msgSender(), tokenIds);
  }

  /**
      * @notice called when user wants to withdraw token back to root chain with token URI
      * @dev Should handle withraw by burning user's token.
      * Should set `withdrawnTokens` mapping to `true` for the tokenId being withdrawn
      * This transaction will be verified when exiting on root chain
      *
      * @param tokenId tokenId to withdraw
      */
  function withdrawWithMetadata(uint256 tokenId) external {

      require(_msgSender() == ownerOf(tokenId), "ChildMintableERC721: INVALID_TOKEN_OWNER");
      withdrawnTokens[tokenId] = true;

      // Encoding metadata associated with tokenId & emitting event
      emit TransferWithMetadata(ownerOf(tokenId), address(0), tokenId, this.encodeTokenMetadata(tokenId));

      _burn(tokenId);

  }

  /**
      * @notice This method is supposed to be called by client when withdrawing token with metadata
      * and pass return value of this function as second paramter of `withdrawWithMetadata` method
      *
      * It can be overridden by clients to encode data in a different form, which needs to
      * be decoded back by them correctly during exiting
      *
      * @param tokenId Token for which URI to be fetched
      */
  function encodeTokenMetadata(uint256 tokenId) external view virtual returns (bytes memory) {
      TokenDataPacked storage token = _tokenMetadata[tokenId];
      return abi.encode(token);
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////
  // L2-implementations of minting functions

  /** */
  function bulkMinting(uint256[] calldata ids, uint16 year) external override onlyRole(MINTER_ROLE) {
    for (uint256 i; i < ids.length; i++) {
      require(!withdrawnTokens[i], "ChildMintableERC721: TOKEN_EXISTS_ON_ROOT_CHAIN");
    }
    _bulkMinting(ids, year);
  }

  function claimToken(uint256 tokenId, address claimant, bytes calldata signature) external override {
    require(!withdrawnTokens[tokenId], "ChildMintableERC721: TOKEN_EXISTS_ON_ROOT_CHAIN");
    _claimToken(tokenId, claimant, signature);
  }
}
