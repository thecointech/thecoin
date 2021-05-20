// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

/// The metadata describing the basic function of each token
struct TokenDataPacked {
  // 20b: The owner of this token
  //address owner; -- Disabled for now.

  // 5b: The timestamp of the last time ipfsHash was updated
  // Valid until
  uint40 lastUpdate;
  // 1b each: The period CO2 will be offset for.
  uint8 validFrom;  // 3-digit year (2000-2256)
  uint8 validUntil;  // 3-digit year (2000-2256)
  // 2b: prefix of IPFS hash.  If 0, then is 0x1220 (sha256)
  uint16 ipfsPrefix;

  // we have 3(?) bytes of padding here

  // The hash of the JSON metadata on IPFS.  Note that IPFS-native
  // data is 64 bytes of Base58 encoded data, or 32 bytes decoded
  // https://ethereum.stackexchange.com/questions/17094/how-to-store-ipfs-hash-using-bytes32?rq=1
  bytes32 ipfsHash;
}

// Unpacked TokenData. Not currently used
struct TokenData {
  address owner;
  uint256 lastUpdate;
  uint256 validFrom;
  uint256 validUntil;
  uint256 ipfsHashPrefix;
  bytes32 ipfsHash;
}
