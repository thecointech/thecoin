/// @title THE:Coin: NFT
/// @author Stephen Taylor
/// @notice An NFT, backed by TheCoin, that certifies it's owner is either CO2-neutral or Paris-Friendly
/// @dev The NFT only holds the data required to verify some data is linked to a token

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

struct TokenDataPacked {
  // 20b: The owner of this token
  address owner;
  // 5b: The timestamp of the last time ipfsHash was updated
  // Valid until
  uint40 lastUpdate;
  // 1b each: Validity interval.
  uint8 validFrom;  // 3-digit year (2000-2256)
  uint8 validUntil;  // 3-digit year (2000-2256)
  // 2b: prefix of IPFS hash.  If 0, then is 0x1220 (sha256)
  uint16 ipfsHashPrefix;

  // we have 3(?) bytes of padding here

  // The hash of the JSON metadata on IPFS.  Note that IPFS-native
  // data is 64 bytes of Base58 encoded data, or 32 bytes decoded
  // https://ethereum.stackexchange.com/questions/17094/how-to-store-ipfs-hash-using-bytes32?rq=1
  bytes32 ipfsHash;
}

// Unpacked TokenData.
struct TokenData {
  address owner;
  uint256 lastUpdate;
  uint256 validFrom;
  uint256 validUntil;
  uint256 ipfsHashPrefix;
  bytes32 ipfsHash;
}

// 20-byte mask
uint256 constant ADDRESS_MASK = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF

contract TheCoinNFT is ERC721, AccessControl {

  // Create a new role identifier for the minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // We may (eventually) mint up to 100K tokens
  uint public constant tokenSupply = 100000;

  // TODO: It is (apparently) cheaper to store in 2 LU tables than in a struct.
  // https://medium.com/@novablitz/storing-structs-is-costing-you-gas-774da988895e

  // Mapping from tokenID to to data
  mapping (uint256 => uint256) private _tokenOwnerData;
  // Mapping from tokenID to it's Sha256 value.
  mapping (uint256 => bytes32) private _tokenMetaSha256;

  constructor(address minter) public ERC721("TheCoinNFT", "TCN") {
    _setupRole(MINTER_ROLE, minter);
  }

  // Decode packed data into composite form
  function getTokenData(uint256 id) external view returns(TokenData memory token) {
    uint256 packedToken = _tokenOwnerData[id];
    token.ipfsHash = _tokenMetaSha256[id];
    token.owner = getOwner(packedToken);
    token.lastUpdate = address(uint40(packedToken>>160));
    token.validFrom = uint256(uint8(packedToken>>200));
    token.validUntil = uint256(uint8(packedToken>>201));
    token.ipfsHashPrefix = uint256(uint16(packedToken>>202));
  }

  function getOwner(uint256 memory packedToken) internal view returns(address memory) {
    return address(packedToken);
  }

  // Bulk-mint tokens.
  function bulkMinting(uint256[] calldata ids, uint256[] calldata packedTokens, bytes32[] calldata hashes) external {
    onlyRole(MINTER_ROLE);

    require(ids.length == datum.length, "Mismatched lists of ID & Datum");
    for (int i = 0; i < proofs.length; i++) {
      require(ids[i] >= tokenSupply, "Cannot mint token with ID > 100K");
      require(onwerOf(ids[i]) == 0, "Minting is overwriting an existing token");

      address to = getOwner(packedToken);
      _balances[to] += 1;
      _tokenOwnerData[ids[i]] = packedTokens[i];
      _tokenMetaSha256[ids[i]] = hashes[i];

      require(_checkOnERC721Received(address(0), to, ids[i], packedTokens[i]), "ERC721: transfer to non ERC721Receiver implementer");

      emit Transfer(address(0), to, ids[i]);
    }
  }

  /**
   * Update the metadata associated with a token.  A user will use this when digitally signing an image.
   */
  function updateMetaSha256(uint256 calldata tokenId, bytes32 sha256 metaHash) external {
    require(_exists(tokenId), "ERC721: operator query for nonexistent token");
    address owner = ERC721.ownerOf(tokenId);
    require(_msgSender() == owner, "ERC721: Update caller is not owner");
    _tokenMetaSha256[ids[i]] = metaHash;
  }

  //////////////////////////////////////////////////////////////////////////////////
  // Built-in function overrides
  // Copied mostly verbatim from ERC721.sol
  // Override all owner-related functionality, modifed for packed owner address

  /**
    * @dev See {IERC721-ownerOf}.
    */
  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
      address owner = address(_tokenOwnerData[tokenId]);
      require(owner != address(0), "ERC721: owner query for nonexistent token");
      return owner;
  }

  /**
    * @dev Returns whether `tokenId` exists.
    */
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
    */
  function _transfer(address from, address to, uint256 tokenId) internal virtual override {
    require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
    require(to != address(0), "ERC721: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    // Clear approvals from the previous owner
    _approve(address(0), tokenId);

    _balances[from] -= 1;
    _balances[to] += 1;

    // Clear existing address from packed data and set new one
    _tokenOwnerData[tokenId] = to | (_tokenOwnerData[tokenId] & ~ADDRESS_MASK);

    emit Transfer(from, to, tokenId);
  }

  //////////////////////////////////////////////////////////////////////////////////

  /**
  * @dev See {IERC721Metadata-tokenURI}.
  */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    return "TODO";
  }

  //////////////////////////////////////////////////////////////////////////////////
  //



}
