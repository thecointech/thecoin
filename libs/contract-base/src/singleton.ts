import type { Provider, Signer } from "ethers";
import { defineSingleton, type SingletonManager } from "@thecointech/utilities/singleton";
import { getProvider } from "@thecointech/ethers-provider";
import type { BaseContract } from "ethers";

export type ContractSingletonManager<T, Args extends any[]> =
  SingletonManager<T, Args> & {
    connect: (signer: Signer) => T;
  };

type ContractFactory<T extends BaseContract> = {
  connect: (address: string, providerOrSigner: Provider | Signer) => T;
}
type AddressFn = () => Promise<string>;

export function defineContractBaseSingleton<T extends BaseContract, Args extends any[] = []>(
  name: string,
  create: (...args: Args) => Promise<T>,
) : ContractSingletonManager<Promise<T>, Args> {
  const base = defineSingleton<Promise<T>>(name, create);
  const connectExtn = {
    connect: async (signer: Signer) => {
      const c = await base.get();
      return c.connect(signer) as T;
    }
  }
  return {
    ...base,
    ...connectExtn,
  }
}

export function defineContractSingleton<T extends BaseContract, Args extends any[] = []>(
  name: string,
  address: string | AddressFn,
  factory: ContractFactory<T>,
) : ContractSingletonManager<Promise<T>, Args> {
  const create = async () => {
    return factory.connect(
      address instanceof Function
        ? await address()
        : address,
      await getProvider());
  }
  return defineContractBaseSingleton(name, create);
}
