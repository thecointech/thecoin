import { accounts, contract, privateKeys } from '@openzeppelin/test-environment';
import { Wallet } from 'ethers';
import { MintableContract, MintableInstance } from '../migrations/types';
import { getTokenClaimCode, getTokenClaimSig } from '../src/tokenCodes';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const nft: MintableContract = contract.fromArtifact('TheGreenNFTL1');

// Ethereum accounts used in these tests

const [
  owner,  // Deploys the smart contract
  minter, // Owns the initial supply
  ...users // rest are users
] = accounts;

jest.setTimeout(30 * 1000);

it("Mints tokens", async () => {

  const nft = await getContract();
  // Create a list of tokens
  const r = await mintTokens(nft, 10);
  expect(r.logs.length).toEqual(10);
})

it("Can claim tokens", async () => {

  const nft = await getContract();
  await mintTokens(nft, 15);
  const auth = new Wallet(privateKeys[1]);
  // user1 claims token1
  const code = await getTokenClaimCode(13, auth);
  // turn it back into a signature
  const sig = getTokenClaimSig(code);
  // test recovery
  const auth2 = await nft.recoverClaimSigner(13, sig);
  expect(auth2).toEqual(auth.address);
    // Use it to mint
  const r = await nft.claimToken(13, users[1], sig);
  expect(r.logs.length).toEqual(2); // Approval & Transfer
  // check ownership transfered
  const owner = await nft.ownerOf(13);
  expect(owner).toEqual(users[1]);
})

const mintTokens = (nft: MintableInstance, count: number) => nft.bulkMinting(Array.from({length: count}, (_, idx) => idx), 2022, {from: minter});
const getContract = () => nft.new(minter, {from: owner});
