import { accounts, contract } from '@openzeppelin/test-environment';
import { TheCoinNFTContract } from '../migrations/types';
import { utils } from 'ethers';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const nft: TheCoinNFTContract = contract.fromArtifact('TheCoinNFT');

// Ethereum accounts used in these tests
const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  ...users // rest are users
] = accounts;


it("Mints tokens", async () => {

  const nft = await getContract();
  // Create a list of tokens
  const now = Math.round(Date.now() / 1000);
  const owners = users;
  const ids = users.map((_, idx) => idx);
  const tokens = users.map((_, idx) => ({
    lastUpdate: now,
    validFrom: 22, // 2022
    validUntil: 25, // 2025
    ipfsPrefix: "0x1220",
    ipfsHash: utils.formatBytes32String(`token number: ${idx}`),
  }));
  const r = await nft.bulkMinting(ids, tokens, owners, {from: minter});
  expect(r.logs.length).toEqual(users.length);
})

const getContract = () => nft.new(minter, {from: owner});