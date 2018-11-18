pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/cryptography/ECDSA.sol";

contract LibCertTransfer {

    function uint2str(uint i) public pure returns (string){
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0){
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }

    function address2str(address _addr) public pure returns(string) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";
    
        bytes memory str = new bytes(40);
        uint8 charIdx = 0;
        for (uint i = 12; i < 32; i++) {
            byte char = value[i];
            str[charIdx++] = alphabet[uint(char >> 4)];
            str[charIdx++] = alphabet[uint(char & 0x0f)];
        }
        return string(str);
    }


    function buildMessage(address from, address to, uint256 value, uint32 fee, uint256 timestamp) 
    public pure returns(string)
    {
        string memory fstr = address2str(from);
        string memory tostr = address2str(to);
        string memory vstr = uint2str(value);
        string memory feestr = uint2str(fee);
        string memory tstr = uint2str(timestamp);
        
        string memory message = string(abi.encodePacked(fstr, "->", tostr, "\nval", vstr, "\nfee", feestr, "\nts", tstr));
        
        return message;
    }
    
    function hashMessage(bytes message)
    internal pure returns (bytes32)
    {
        string memory len = uint2str(message.length);
        return keccak256(
          abi.encodePacked("\x19Ethereum Signed Message:\n", len, message)
        );
    }
    
    function recoverSigner(address from, address to, uint256 value, uint32 fee, uint256 timestamp, bytes signature)
	internal pure returns (address)
	{
		string memory message = buildMessage(from, to, value, fee, timestamp);
        address signer = recover(message, signature);
        return signer;
	}

	function recover(string message, bytes signature)
    internal pure returns (address)
    {
        bytes32 hash = hashMessage(bytes(message));
        return recover(hash, signature);
    }

  /**
   * Taken from Zeppelin/ECDSA.sol.  Mostly cause I can't figure out how to link a library fn in
   * @dev Recover signer address from a message by using their signature
   * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
   * @param signature bytes signature, the signature is generated using web3.eth.sign()
   */
  function recover(bytes32 hash, bytes signature)
    internal
    pure
    returns (address)
  {
    bytes32 r;
    bytes32 s;
    uint8 v;

    // Check the signature length
    if (signature.length != 65) {
      return (address(0));
    }

    // Divide the signature in r, s and v variables
    // ecrecover takes the signature parameters, and the only way to get them
    // currently is to use assembly.
    // solium-disable-next-line security/no-inline-assembly
    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := byte(0, mload(add(signature, 96)))
    }

    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }

    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      // solium-disable-next-line arg-overflow
      return ecrecover(hash, v, r, s);
    }
  }
}