import { Signer, utils } from 'ethers';

//
// IMPORTANT NOTE:
// Even though we are using Ethers directly, under the hood we may be
// communicating with a web3 node.  Differing implementations of signMessage
// treat the chechsum differently, with web3 using a single bit (0-1), and
// the standard (basically, everyone else) using the values 27-28 to verify
// the signature.  We normalize the generated signature here to follow
// the standard, and quietly curse the fragmented landscape that makes this possible.
// https://ethereum.stackexchange.com/questions/76810/sign-message-with-web3-and-verify-with-openzeppelin-solidity-ecdsa-sol
export async function signMessage(message: utils.Arrayish, signer: Signer) {
  const signature = await signer.signMessage(message);

  // We expect sig to either be 0-1, or 27-28.  Normalize to 27-28 by
  // adding 27 if the value < 16 (ie, higher 4 bits are 0)
  return (signature.length == 132 && (signature[130] == '0'))
    ? signature.substr(0, 130) + (signature.substr(130) == "00" ? "1b" : "1c")
    : signature;
}
