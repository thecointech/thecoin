/// @title IPFS Uri Generator
/// @author Stephen Taylor
/// @notice Simple utils class handles generating a URI for IPFS content from our raw storage
/// @dev This class is imported by our NFT to simplify the testing etc. 

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./IMintableERC721.sol";
import "../TheCoinNFT.sol";
import "../IMintable.sol";

//
// Polygon compatibility.
// Allows L1 <=> L2 compatibility
// Src: https://github.com/maticnetwork/pos-portal/blob/master/flat/ChildMintableERC721.sol
//
contract TheGreenNFTL1 is TheCoinNFT, IMintableERC721, IMintable {

  // Depositor is the child chain manager
  bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");

  //
  // Mapping of tokens that have been sent to L1
  mapping (uint256 => bool) public externalTokens;


  /** Basic setup & access control patterns */
  constructor(
      address minter,
      address predicate
  ) TheCoinNFT(minter) {
    _setupRole(PREDICATE_ROLE, predicate);
  }

  // We can either mint on 

    // We cannot mint raw functions without the metadata
    function mint(address /*user*/, uint256 /*tokenId*/) external pure override {
        revert("Cannot mint tokens without metadata");
    }

    /**
        * @dev See {IMintableERC721-mint}.
        * 
        * If you're attempting to bring metadata associated with token
        * from L2 to L1, you must implement this method
        */
    function mint(address user, uint256 tokenId, bytes calldata metaData) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, tokenId);
        setTokenMetadata(tokenId, metaData);
    }

    /**
        * If you're attempting to bring metadata associated with token
        * from L2 to L1, you must implement this method, to be invoked
        * when minting token back on L1, during exit
        */
    function setTokenMetadata(uint256 tokenId, bytes memory data) internal virtual {
        // This function should decode metadata obtained from L2
        // and attempt to set it for this `tokenId`
        TokenDataPacked memory tokendata = abi.decode(data, (TokenDataPacked));
        require(_tokenMetadata[tokenId].lastUpdate == 0, "Cannot set metadata for active token");
        _tokenMetadata[tokenId] = tokendata;
    }

    function exists(uint256 tokenId) external override view returns (bool) {
        return _exists(tokenId);
    }

    //////////////////////////////////////////////////////////////
    // IMintable
    // NOTE: This needs to be locked down so only one chain (main
    // or polygon) can mint at any time.  However, we don't want to
    // lock ourselves into polygon, so we keep this functionality
    function bulkMinting(uint256[] calldata ids, uint16 year) external override {
        _bulkMinting(ids, year);
    }

  function claimToken(uint256 tokenId, address claimant, bytes calldata signature) external override {
      _claimToken(tokenId, claimant, signature);
  }
}