import { splitIpfsUri } from './ipfs'

it('correctly encodes a IPFS URI', () => {
  const { gateway, prefix, digest } = splitIpfsUri("https://gateway.pinata.cloud/ipfs/Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8");
  expect(gateway).toEqual("https://gateway.pinata.cloud/ipfs/");
  expect(prefix).toEqual("0x1220");
  expect(digest).toEqual("0xae36202d984e0a74493a55256f837145e80a7df9e45ac557ca244ae11c4e6d83");
});

it('handles a missing gateway', () => {
  const { gateway, prefix, digest } = splitIpfsUri("Qma4hWzmKGzmGo1TDcHxCNLCgFu7aQTwG6pLbV6XPF2MT8");
  expect(gateway).toBeFalsy();
  expect(prefix).toEqual("0x1220");
  expect(digest).toEqual("0xae36202d984e0a74493a55256f837145e80a7df9e45ac557ca244ae11c4e6d83");
});