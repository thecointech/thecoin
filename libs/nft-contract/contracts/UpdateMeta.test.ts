import { accounts, privateKeys, contract } from '@openzeppelin/test-environment';
import { Wallet } from 'ethers';
import { TheCoinNFTContract } from '../migrations/types';
import { signGasslessUpdate, splitIpfsUri } from '../src';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const factory: TheCoinNFTContract = contract.fromArtifact('TheCoinNFT');

// Ethereum accounts used in these tests
const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  user, // rest are users
] = accounts;

const wallet = new Wallet(privateKeys[2]);
const id = 1;
// Sample data for updating metadata
const sampleUri = "https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8";
const { prefix, digest } = splitIpfsUri(sampleUri);

jest.setTimeout(30 * 1000);

it('Can update metadata', async () => {
  const nft = await init();
  // Can we update it to a legitimate metadata
  await nft.updateMetaSha256(1, prefix, digest, { from: user});
  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(1);
  expect(tokenUri).toEqual(sampleUri);
})

it('Can do gassless update of metadata', async () => {
  const nft = await init();
  // Can we do a gassless update?
  const r = await signGasslessUpdate(wallet, id, 0, prefix, digest);
  await nft.updateMetaSha256GassLess(id, prefix, digest, r.signature);
  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(id);
  expect(tokenUri).toEqual(sampleUri);
})

it('Can reset token', async () => {
  // Mint a random NFT
  const nft = await init();
  // Set and Reset URI
  await nft.updateMetaSha256(1, prefix, digest, { from: user});
  await nft.resetMetaSha256(id, {from: user });
  // Check that the URI is back to default
  const tokenUri = await nft.tokenURI(id);
  const defaultUri = await nft.defaultTokenUri();
  expect(tokenUri).toEqual(defaultUri);
})

const init = async () => {
  const nft = await factory.new(minter, {from: owner});
  await nft.bulkMinting([id], 2022, {from: minter});
  await nft.transferFrom(minter, user, id, {from: minter})
  return nft;
}
