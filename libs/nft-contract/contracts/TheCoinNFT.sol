/// @title THE:Coin: NFT
/// @author Stephen Taylor
/// @notice An NFT, backed by TheCoin, that certifies it's owner is either CO2-neutral or Paris-Friendly
/// @dev The NFT only holds the data required to verify some data is linked to a token

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IPFS.sol";
import "./UpdateMeta.sol";
import "./Mintable.sol";


contract TheCoinNFT is Mintable, UpdateMeta, IPFSUriGenerator {
  using ECDSA for bytes32;

  constructor(address minter)
    Mintable(minter) {}

  ///////////////////////////////////////////////////////////////////////
  // Built-in overrides.

  /**
  * @dev See {IERC721Metadata-tokenURI}.
  */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
    TokenDataPacked storage token = _tokenMetadata[tokenId];
    return buildIpfsURI(token.ipfsPrefix, token.ipfsHash);
  }

  ///////////////////////////////////////////////////////////////////////
  // Custom functions.

  /**
   * Get the URI tokens will be initialized to (and reset back to)
   */
  function defaultTokenUri() external view returns (string memory) {
    return buildIpfsURI(defaultIpfsPrefix, defaultIpfsHash);
  }

  /**
   * Set the default IPFS data tokens are initialized to.
    */
  function setDefaultIpfsData(bytes32 newDefaultHash, uint16 newDefaultPrefix)  external onlyRole(DEFAULT_ADMIN_ROLE) {
    defaultIpfsHash = newDefaultHash;
    defaultIpfsPrefix = newDefaultPrefix;
  }

  /**
   * Allow setting an IPFS gateway.  All tokenURI's will be relative to this link
   */
  function setBaseURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
    setGateway(newUri);
  }

  // TODO: Once validated, we can try applying the below optimizations to improve
  // our efficiency.  It is (apparently) cheaper to store in 2 LU tables than in a struct.
  // https://medium.com/@novablitz/storing-structs-is-costing-you-gas-774da988895e
  // Mapping from tokenID to to data
  //mapping (uint256 => uint256) private _tokenOwnerData;
  // Mapping from tokenID to it's Sha256 value.
  ///mapping (uint256 => bytes32) private _tokenMetaSha256;

  /**
    * @dev Decode packed uint256 data into struct form

  function getTokenData(uint256 id) external view returns(TokenData memory token) {
    uint256 packedToken = _tokenOwnerData[id];
    token.ipfsHash = _tokenMetaSha256[id];
    token.owner = unpackOwner(packedToken);
    token.lastUpdate = uint256(uint40(packedToken>>160));
    token.validFrom = uint256(uint8(packedToken>>200));
    token.validUntil = uint256(uint8(packedToken>>201));
    token.ipfsHashPrefix = uint256(uint16(packedToken>>202));
  }

  function unpackOwner(uint256 packedToken) internal view returns(address) {
    return address(uint160(packedToken));
  }


  // Bulk-mint tokens.  The values set here should be pre-computed
  // before being passed to this function.
  function bulkMinting(uint256[] calldata ids, uint256[] calldata packedTokens, bytes32[] calldata hashes) external onlyRole(MINTER_ROLE) {
    require(ids.length == packedTokens.length && ids.length == hashes.length, "Mismatched lengths of ID, token, and hash");
    for (uint i = 0; i < ids.length; i++) {
      require(ids[i] >= tokenSupply, "Cannot mint token with ID > 100K");
      require(ownerOf(ids[i]) == address(0), "Minting is overwriting an existing token");

      address to = unpackOwner(packedTokens[i]);
      _balances[to] += 1;
      _tokenOwnerData[ids[i]] = packedTokens[i];
      _tokenMetaSha256[ids[i]] = hashes[i];

      require(ERC721._checkOnERC721Received(address(0), to, ids[i], packedTokens[i]), "ERC721: transfer to non ERC721Receiver implementer");

      emit Transfer(address(0), to, ids[i]);
    }
  }

  /**
   * Update the metadata associated with a token.  A user will use this when signing an image

  function updateMetaSha256(uint256 tokenId, bytes32 metaHash) external {
    require(_exists(tokenId), "ERC721: operator query for nonexistent token");
    address owner = ERC721.ownerOf(tokenId);
    require(_msgSender() == owner, "ERC721: Update caller is not owner");
    _tokenMetaSha256[tokenId] = metaHash;
  }

  //////////////////////////////////////////////////////////////////////////////////
  // Built-in function overrides
  // Copied mostly verbatim from ERC721.sol
  // Override all owner-related functionality, modifed for packed owner address

  /**
    * @dev See {IERC721-ownerOf}.

  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
      address owner = address(_tokenOwnerData[tokenId]);
      require(owner != address(0), "ERC721: owner query for nonexistent token");
      return owner;
  }

  /**
    * @dev Returns whether `tokenId` exists.

  function _exists(uint256 tokenId) internal view virtual override returns (bool) {
      return _tokenOwnerData[tokenId] != 0;
  }

  /**
    * @dev Transfers `tokenId` from `from` to `to`.
    *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
    *
    * Requirements:
    *
    * - `to` cannot be the zero address.
    * - `tokenId` token must be owned by `from`.
    *
    * Emits a {Transfer} event.

  uint256 private constant ADDRESS_MASK = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
  function _transfer(address from, address to, uint256 tokenId) internal virtual override {
    require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
    require(to != address(0), "ERC721: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    // Clear approvals from the previous owner
    _approve(address(0), tokenId);

    ERC721._balances[from] -= 1;
    ERC721._balances[to] += 1;

    // Clear existing address from packed data and set new one
    // 20-byte mask
    _tokenOwnerData[tokenId] = to | (_tokenOwnerData[tokenId] & ~ADDRESS_MASK);

    emit Transfer(from, to, tokenId);
  }

  */


}
