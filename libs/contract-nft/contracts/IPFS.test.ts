import { jest } from '@jest/globals';
import { splitIpfsUri } from '../src/ipfs';
import hre from 'hardhat';

jest.setTimeout(30 * 1000);

it("Decodes URI's correctly", async () => {
  const sampleUri = "https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8";
  const { prefix, digest } = splitIpfsUri(sampleUri);
  const IPFS = await hre.ethers.getContractFactory("IPFSUriGenerator");
  const ipfs = await IPFS.deploy();
  const r = await ipfs.buildIpfsURI(prefix, digest);
  expect(r).toEqual(sampleUri);
})
