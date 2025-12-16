import { jest, expect, it } from "@jest/globals";
import { defineSingleton } from "./singleton";
import { HDNodeWallet, EtherscanProvider, type Signer } from "ethers";

beforeEach(() => {
  jest.resetAllMocks();
})
it ('appropriately handles signer arguments', async () => {
  const create = jest.fn((signer?: Signer) => Promise.resolve({signer}))
  const SignerArgTest = defineSingleton('__test', create);

  const instance = await SignerArgTest.get();
  expect(instance.signer).toBeUndefined();

  const signer1 = HDNodeWallet.createRandom();
  const instance1 = await SignerArgTest.get(signer1);
  expect(instance1.signer).toBe(signer1);
  expect(create).toHaveBeenCalledTimes(2);

  const instance2 = await SignerArgTest.get(signer1);
  expect(instance2.signer).toBe(signer1);
  expect(create).toHaveBeenCalledTimes(2);

  const signer3 = HDNodeWallet.createRandom();
  const instance3 = await SignerArgTest.get(signer3);
  expect(instance3.signer).toBe(signer3);
  expect(create).toHaveBeenCalledTimes(3);
  SignerArgTest.reset();
})

it ('appropriately handles provider arguments', async () => {
  const create = jest.fn((provider?: EtherscanProvider) => Promise.resolve({provider}))
  const ProviderArgTest = defineSingleton('__test', create);

  const instance = await ProviderArgTest.get();
  expect(instance.provider).toBeUndefined();
  expect(create).toHaveBeenCalledTimes(1);

  const provider1 = await new EtherscanProvider();
  const instance1 = await ProviderArgTest.get(provider1);
  expect(instance1.provider).toBe(provider1);
  expect(create).toHaveBeenCalledTimes(2);

  const instance2 = await ProviderArgTest.get(provider1);
  expect(instance2.provider).toBe(provider1);
  expect(create).toHaveBeenCalledTimes(2);

  const instance3 = await ProviderArgTest.get();
  expect(instance3.provider).toBeUndefined();
  expect(create).toHaveBeenCalledTimes(2);
  ProviderArgTest.reset();

  // mocked providers are always equivalent, so further tests aren't useful.
})
