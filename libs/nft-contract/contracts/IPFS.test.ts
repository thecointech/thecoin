import { contract } from '@openzeppelin/test-environment';
import { IPFSUriGeneratorContract } from '../migrations/types';
import { splitIpfsUri } from '../src/ipfs';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const ipfs: IPFSUriGeneratorContract = contract.fromArtifact('IPFSUriGenerator');

it("Decodes URI's correctly", async () => {
  jest.setTimeout(30 * 1000);
  const sampleUri = "https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8";
  const { prefix, digest } = splitIpfsUri(sampleUri);
  const ipfs = await getContract();
  const r = await ipfs.buildIpfsURI(prefix, digest);
  expect(r).toEqual(sampleUri);
})

const getContract = () => ipfs.new();