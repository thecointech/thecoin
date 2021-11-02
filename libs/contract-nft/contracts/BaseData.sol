/// @title Base Data
/// @author Stephen Taylor
/// @notice This class specifies the common data of TheCoinNFT
/// @dev We split out the data into a base file so we can reference it from our various implementation classes

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./TokenData.sol";

abstract contract BaseData is ERC721Enumerable, AccessControl {

  // We may (eventually) mint up to 100K tokens.  This is not editable
  uint public constant tokenSupply = 100000;

   // Max possible value. Really, really big.  Leave enough padding
   // off the end so that our validity function doesn't wrap
  uint public constant MAX_INTEGER = 2**256 - 1;

  // For PoC, we don't care about efficiency, so just duplicate the whole mapping.
  mapping (uint256 => TokenDataPacked) internal _tokenMetadata;

  // The default state for a token.
  // Tokens will be initialized to this default state
  // and may be reset back (eg, for resale etc);
  uint16 internal defaultIpfsPrefix;
  bytes32 internal defaultIpfsHash;

  /**
    * @dev Initialize basic data.
    */
  constructor() ERC721("TheCoinNFT", "TCN") {}

  function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721Enumerable) returns (bool) {
    return ERC721Enumerable.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
  }

  /**
   * Query if the given TokenID is able to updated.  Updates are limited to once per 3 months
   */
  function canUpdate(uint256 tokenId) public view returns (bool) {
    if (!_exists(tokenId)) return false;
    return canUpdate(_tokenMetadata[tokenId]);
  }

  /**
   * Query the lastUpdate time of a given token
   */
  function lastUpdate(uint256 tokenId) public view returns (uint40) {
    if (!_exists(tokenId)) return 0;
    return _tokenMetadata[tokenId].lastUpdate;
  }

  /**
   * Returns the starting year this token begins offsetting CO2
   */
  function validFrom(uint256 tokenId) public view returns (uint16){
    if (!_exists(tokenId)) return 0;
    return _tokenMetadata[tokenId].validFrom;
  }

  /**
   * Get the number of years a given token is valid for.
   */
  function yearsValid(uint256 tokenId) public pure returns (uint256) {
    if (tokenId >= tokenSupply) return 0;
    // 5-digit are 1-yr tokens, CO2-safe tokens
    if (tokenId >= 10000) return 1;
    // 4-digit are 5-yr tokens, CO2-safe tokens
    if (tokenId >= 1000) return 5;
    // 3-digit are 50-yr tokens, CO2-safe tokens
    if (tokenId >= 100) return 50;
    // 2-digit are 50-yr tokens, CO2-neutral tokens
    if (tokenId >= 10) return 50;
    // single-digit: CO2-neutral. Valid for the age of the universe.
    // These tokens rely partly on asset growth & partly initial deposit
    // to earn sufficient dividends to stay viable.
    return MAX_INTEGER;
  }

  /**
   * Convenience function, return validity [from, till).
   */
  function validity(uint256 tokenId) public view returns (uint256, uint256) {
    if (!_exists(tokenId)) return (0, 0);
    uint256 from = validFrom(tokenId);
    uint256 duration  = yearsValid(tokenId);
    if (duration == MAX_INTEGER)
      return (from, MAX_INTEGER);
    else return (from, from + duration);
  }

  ////////////////////////////////
  // Internal fns

  function canUpdate(TokenDataPacked storage token) internal view returns (bool) {
    return (block.timestamp - token.lastUpdate) > 21600;
  }
}
