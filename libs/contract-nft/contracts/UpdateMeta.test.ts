import { jest } from '@jest/globals';
import { signGasslessUpdate, splitIpfsUri } from '../src';
import hre from 'hardhat';

// Ethereum accounts used in these tests
const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  user, // rest are users
] = await hre.ethers.getSigners();;

const id = 1;
// Sample data for updating metadata
const sampleUri = "https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8";
const { prefix, digest } = splitIpfsUri(sampleUri);

jest.setTimeout(30 * 1000);

it('Can update metadata', async () => {
  const nft = await init();
  // Can we update it to a legitimate metadata
  await nft.connect(user).updateMetaSha256(1, prefix, digest);
  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(1);
  expect(tokenUri).toEqual(sampleUri);
})

it('Can do gassless update of metadata', async () => {
  const nft = await init();
  // Can we do a gassless update?
  const r = await signGasslessUpdate(user, id, 0, prefix, digest);
  await nft.updateMetaSha256GassLess(id, prefix, digest, r.signature);
  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(id);
  expect(tokenUri).toEqual(sampleUri);
})

it('Can reset token', async () => {
  // Mint a random NFT
  const nft = (await init()).connect(user);
  // Set and Reset URI
  await nft.updateMetaSha256(1, prefix, digest);
  await nft.resetMetaSha256(id);
  // Check that the URI is back to default
  const tokenUri = await nft.tokenURI(id);
  const defaultUri = await nft.defaultTokenUri();
  expect(tokenUri).toEqual(defaultUri);
})

const init = async () => {
  const NFT = await hre.ethers.getContractFactory("TheGreenNFTL2", minter);
  const nft = await NFT.deploy(minter.address, minter.address);

  await nft.bulkMinting([id], 2022);
  await nft.transferFrom(minter.address, user.address, id)
  return nft;
}
