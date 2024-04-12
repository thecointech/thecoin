/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details

// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "./Mintable.sol";

abstract contract Gassless is Mintable {

  // A stored list of timestamps that are used to uniquely
  // specify transactions running through paidTransaction.
  // Each tx comes with a timestamp that must be higher than
  // the last tx timestamp, and (more or less) be in the
  // same time as the block being mined.  This ensures
  // tx authentications are unique, and expire
  // relatively shortly after issue
  mapping(address => uint) lastTxTimestamp;

  // ------------------------------------------------------------------------
  // Additional paid-transfer functions allows a client to sign a request
  // and for the request to be paid by someone else (likely us)
  // Apparently this is now a thing (gass-less transactions), but our
  // implementation appears significantly more efficient.
  // ------------------------------------------------------------------------
  function certifiedTransfer(uint chainId, address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature) public virtual
    timestampIncreases(from, timestamp)
  {
    require(chainId == block.chainid, "chainId different from current chainId");
      address signer = recoverSigner(chainId, from, to, value, fee, timestamp, signature);
      require(signer == from, "Invalid signature for address");
      _transfer(from, to, value);
      _transfer(from, msg.sender, fee);

      emit ExactTransfer(from, to, value, timestamp);
      lastTxTimestamp[from] = timestamp;
  }

	function buildMessage(uint chainId, address from, address to, uint256 value, uint256 fee, uint256 timestamp) public pure returns (bytes32)
	{
		bytes memory packed = abi.encodePacked(chainId, from, to, value, fee, timestamp);
		return keccak256(packed);
	}

	function recoverSigner(uint chainId, address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature) public pure returns (address)
	{
		// This recreates the message that was signed on the client.
    bytes32 message = buildMessage(chainId, from, to, value, fee, timestamp);
		bytes32 signedMessage = ECDSAUpgradeable.toEthSignedMessageHash(message);
		return ECDSAUpgradeable.recover(signedMessage, signature);
	}

  modifier timestampIncreases(address from, uint256 timestamp)
  {
    require(timestamp > lastTxTimestamp[from], "Provided timestamp is lower than recorded timestamp");
    _;
  }

}
