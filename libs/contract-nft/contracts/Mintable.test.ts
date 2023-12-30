import hre from 'hardhat';
import { jest } from '@jest/globals';
import { getTokenClaimCode, getTokenClaimSig } from '../src/tokenCodes';
import type { TheGreenNFTL2 } from '../src/types';
import '@nomiclabs/hardhat-ethers';

const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  ...users // rest are users
] = await hre.ethers.getSigners();;

jest.setTimeout(30 * 1000);

it("Mints tokens", async () => {

  const nft = await getContract();
  // Create a list of tokens
  const r = await mintTokens(nft, 10);
  const receipt = await r.wait();
  expect(receipt.events?.length).toEqual(10);
})

it("Can claim tokens", async () => {

  const nft = await getContract();
  await mintTokens(nft, 15);
  // user1 claims token1
  const code = await getTokenClaimCode(13, minter);
  // turn it back into a signature
  const sig = getTokenClaimSig(code);
  // test recovery
  const auth2 = await nft.recoverClaimSigner(13, sig);
  expect(auth2).toEqual(minter.address);
    // Use it to mint
  const r = await nft.claimToken(13, users[1].address, sig);
  const receipt = await r.wait();
  expect(receipt.events?.length).toEqual(2); // Approval & Transfer
  // check ownership transfered
  const owner = await nft.ownerOf(13);
  expect(owner).toEqual(users[1].address);
})

const mintTokens = (nft: TheGreenNFTL2, count: number) => nft.bulkMinting(Array.from({length: count}, (_, idx) => idx), 2022);
const getContract = async () => {
  const NFT = await hre.ethers.getContractFactory("TheGreenNFTL2", minter);
  return await NFT.deploy(minter.address, minter.address);
}
