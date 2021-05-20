import { accounts, contract } from '@openzeppelin/test-environment';
import { Wallet } from 'ethers';
import { TheCoinNFTContract, TheCoinNFTInstance } from '../migrations/types';
import { signGasslessUpdate, splitIpfsUri } from '../src/ipfs';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const nft: TheCoinNFTContract = contract.fromArtifact('TheCoinNFT');

// Ethereum accounts used in these tests
const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  ...users // rest are users
] = accounts;

// Sample data for updating metadata
const sampleUri = "https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8";
const { prefix, digest } = splitIpfsUri(sampleUri);

jest.setTimeout(30 * 1000);

it("Mints tokens", async () => {

  const nft = await getContract();
  // Create a list of tokens
  const r = await mintForUsers(users, nft);
  expect(r.logs.length).toEqual(users.length);
})

it('Can update metadata', async () => {
  // Mint a random NFT
  const nft = await getContract();
  const user = users[1];
  await mintForUsers([user], nft);

  // Can we update it to a legitimate metadata
  await nft.updateMetaSha256(0, prefix, digest, { from: user});

  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(0);
  expect(tokenUri).toEqual(sampleUri);
})

it('Can do gassless update of metadata', async () => {
  // Mint a random NFT
  const nft = await getContract();
  const id = randomId();
  const user = Wallet.createRandom();
  await mintForUsers([user.address], nft, id);

  // Can we do a gassless update?
  const signature = await signGasslessUpdate(user, id, 0, prefix, digest);
  await nft.updateMetaSha256GassLess(id, prefix, digest, signature);

  // Check that the data stored is legitimate
  const tokenUri = await nft.tokenURI(id);
  expect(tokenUri).toEqual(sampleUri);
})

const randomId = () => Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % 100000;
const getContract = () => nft.new(minter, {from: owner});
const getNftMeta = () =>  ({
  lastUpdate: 0,
  validFrom: 22, // 2022
  validUntil: 25, // 2025
  ipfsPrefix: "0x1220",
  ipfsHash: "0x".padEnd(66, "0"),
})
const mintForUsers = async (users: string[], nft: TheCoinNFTInstance, startId = 0) => {
  const ids = users.map((_, idx) => idx + startId);
  const tokens = users.map(getNftMeta);
  return nft.bulkMinting(ids, tokens, users, {from: minter});
}