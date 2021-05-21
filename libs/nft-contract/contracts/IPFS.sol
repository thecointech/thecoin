/// @title IPFS Uri Generator
/// @author Stephen Taylor
/// @notice Simple utils class handles generating a URI for IPFS content from our raw storage
/// @dev This class is imported by our NFT to simplify the testing etc. 

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract IPFSUriGenerator {

  bytes constant ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  // baseURI for the token metadata files.  This may be modified by the owner
  // It is required that the gateway always ends with "/ipfs/"
  string public ipfsGateway = "https://gateway.pinata.cloud/ipfs/";

  // Update the base URI.  The inheriting contract should call this function
  function setGateway(string calldata gateway) internal {
    ipfsGateway = gateway;
  }

  /// @dev Create a full URI for the IPFS data.
  function buildIpfsURI(uint16 prefix, bytes32 digest) public view returns(string memory) {
    bytes memory data = abi.encodePacked(prefix, digest);
    return string(abi.encodePacked(ipfsGateway, toBase58(data)));
  }

  ///////////////////////////////////////////////////////////////////////
  /// Note, The below is mostly borrowed from https://github.com/MrChico/verifyIPFS/blob/master/contracts/verifyIPFS.sol

  /// @dev Encode raw bytes in base58
  function toBase58(bytes memory source) internal pure returns (bytes memory) {
    if (source.length == 0) return new bytes(0);
    uint8[] memory digits = new uint8[](50);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint i = 0; i<source.length; ++i) {
        uint carry = uint8(source[i]);
        for (uint j = 0; j<digitlength; ++j) {
            carry += uint(digits[j]) * 256;
            digits[j] = uint8(carry % 58);
            carry = carry / 58;
        }
        
        while (carry > 0) {
            digits[digitlength] = uint8(carry % 58);
            digitlength++;
            carry = carry / 58;
        }
    }
    return toAlphabet(reverse(truncate(digits, digitlength)));
  }

  function truncate(uint8[] memory array, uint8 length) internal pure returns (uint8[] memory) {
    uint8[] memory output = new uint8[](length);
    for (uint i = 0; i<length; i++) {
        output[i] = array[i];
    }
    return output;
  }

  function reverse(uint8[] memory input) internal pure returns (uint8[] memory) {
    uint8[] memory output = new uint8[](input.length);
    for (uint i = 0; i<input.length; i++) {
        output[i] = input[input.length-1-i];
    }
    return output;
  }
  
  function toAlphabet(uint8[] memory indices) internal pure returns (bytes memory) {
    bytes memory output = new bytes(indices.length);
    for (uint i = 0; i<indices.length; i++) {
        output[i] = ALPHABET[indices[i]];
    }
    return output;
  }
}