import { BaseContract, Provider, type Transaction } from "ethers";

const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => e > m ? e : m);

const throwError = (msg: string): never => { throw new Error(msg) };

function getProvider(providerOrContract: Provider|BaseContract) {
  return (
    ((providerOrContract as BaseContract).runner?.provider) ??
    (
      (providerOrContract as Provider).getFeeData
        ? (providerOrContract as Provider)
        : throwError("No Provider Found")
    )
  )
}

const MinimumBloodsuckerFee = BigInt(30 * Math.pow(10, 9));

export async function getOverrideFees(providerOrContract: Provider|BaseContract, prior?: Transaction) {
  const provider = await getProvider(providerOrContract);
  const fees = await provider.getFeeData();
  if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) {
    throw new Error("Fee data not available");
  };

  // calculate new maximums at least 10% higher than previously
  const base = fees.maxFeePerGas - fees.maxPriorityFeePerGas;
  const priorTip = prior?.maxPriorityFeePerGas;
  const newMinimumTip = priorTip
    ? BigInt(Number(priorTip) * 1.1)
    : MinimumBloodsuckerFee;
  const tip = bigIntMax(fees.maxPriorityFeePerGas, newMinimumTip);
  return {
    maxFeePerGas: (base * 2n) + tip,
    maxPriorityFeePerGas: tip,
  }
}
