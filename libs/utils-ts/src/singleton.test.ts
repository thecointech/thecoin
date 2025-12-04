import { jest, expect, it } from "@jest/globals";
import { defineSingleton } from "./singleton";
import type { Signer, Provider } from "ethers";
import { HDNodeWallet } from "ethers";
import { getProvider } from "@thecointech/ethers-provider";

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
})

it ('appropriately handles provider arguments', async () => {
  const create = jest.fn((provider?: Provider) => Promise.resolve({provider}))
  const ProviderArgTest = defineSingleton('__test', create);

  const instance = await ProviderArgTest.get();
  expect(instance.provider).toBeUndefined();

  const provider1 = await getProvider();
  const instance1 = await ProviderArgTest.get(provider1);
  expect(instance1.provider).toBe(provider1);
  expect(create).toHaveBeenCalledTimes(2);

  const instance2 = await ProviderArgTest.get(provider1);
  expect(instance2.provider).toBe(provider1);
  expect(create).toHaveBeenCalledTimes(2);

  const instance3 = await ProviderArgTest.get();
  expect(instance3.provider).toBeUndefined();
  expect(create).toHaveBeenCalledTimes(2);

  // mocked providers are always equivalent, so further tests aren't useful.
})
