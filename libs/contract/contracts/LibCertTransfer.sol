pragma solidity ^0.5.0;

import "zeppelin/contracts/cryptography/ECDSA.sol";
//import "./Seriality/Seriality.sol";

contract LibCertTransfer {

	// function uint2str(uint i) 
	// public pure returns (string memory)
	// {
	// 	if (i == 0) return "0";
	// 	uint j = i;
	// 	uint length;
	// 	while (j != 0){
	// 		length++;
	// 		j /= 10;
	// 	}
	// 	bytes memory bstr = new bytes(length);
	// 	uint k = length - 1;
	// 	while (i != 0){
	// 		bstr[k--] = byte(uint8(48 + i % 10));
	// 		i /= 10;
	// 	}
	// 	return string(bstr);
	// }

	// // function address2str(address _addr) 
	// // public pure returns(string memory) 
	// // {
	// // 	bytes32 value = bytes32(uint256(_addr));
	// // 	bytes memory alphabet = "0123456789abcdef";

	// // 	bytes memory str = new bytes(40);
	// // 	uint8 charIdx = 0;
	// // 	for (uint i = 12; i < 32; i++) {
	// // 		byte char = value[i];
	// // 		str[charIdx++] = alphabet[uint(char >> 4)];
	// // 		str[charIdx++] = alphabet[uint(char & 0x0f)];
	// // 	}
	// // 	return string(str);
	// // }


	// function buildMessage(address from, address to, uint256 value, uint256 fee, uint256 timestamp) 
	// public pure returns(bytes memory)
	// {
	// 	// from, "->", to, "\nval", vstr, "\nfee", feestr, "\nts", tstr
	// 	uint256 offset = 20 + 20 + 32 + 32 + 32;
	// 	bytes memory buffer = new bytes(offset);

	// 	addressToBytes(offset, from, buffer);
	// 	offset -= sizeOfAddress();

	// 	addressToBytes(offset, to, buffer);
	// 	offset -= sizeOfAddress();

	// 	uintToBytes(offset, value, buffer);
	// 	offset -= sizeOfUint(256);

	// 	uintToBytes(offset, fee, buffer);
	// 	offset -= sizeOfUint(256);

	// 	uintToBytes(offset, timestamp, buffer);
	// 	offset -= sizeOfUint(256);

	// 	// We can remove this require after testing.
	// 	require(offset == 0);
	// 	return buffer;

	// 	// string memory fstr = address2str(from);
	// 	// string memory tostr = address2str(to);
	// 	// string memory vstr = uint2str(value);
	// 	// string memory feestr = uint2str(fee);
	// 	// string memory tstr = uint2str(timestamp);
		
	// 	// string memory message = string(abi.encodePacked(fstr, "->", tostr, "\nval", vstr, "\nfee", feestr, "\nts", tstr));
		
	// }

	// function hashMessage(bytes memory message)
	// internal pure returns (bytes32)
	// {
	// 	string memory len = uint2str(message.length);
	// 	return keccak256(
	// 		abi.encodePacked("\x19Ethereum Signed Message:\n", len, message)
	// 	);
	// }

	// function recover(bytes memory message, bytes memory signature)
	// internal pure returns (address)
	// {
	// 	bytes32 hash = hashMessage(message);
	// 	return ECDSA.recover(hash, signature);
	// }

	function buildMessage(address from, address to, uint256 value, uint256 fee, uint256 timestamp)
	public pure returns (bytes32)
	{
		bytes memory packed = abi.encodePacked(from, to, value, fee, timestamp);
		return keccak256(packed);
	}

	function recoverSigner(address from, address to, uint256 value, uint256 fee, uint256 timestamp, bytes memory signature)
	public pure returns (address)
	{
		// This recreates the message that was signed on the client.
    	bytes32 message = buildMessage(from, to, value, fee, timestamp);
		bytes32 signedMessage = ECDSA.toEthSignedMessageHash(message);
		return ECDSA.recover(signedMessage, signature);

		// bytes memory message = buildMessage(from, to, value, fee, timestamp);
		// address signer = recover(message, signature);
		//return signer;
	}
}