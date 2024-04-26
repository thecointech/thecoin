import { BaseContract, Provider, type Transaction } from "ethers";

const MinimumBloodsuckerFee = BigInt(30 * Math.pow(10, 9));
const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => e > m ? e : m);

export async function getOverrideFees(provider: Provider|BaseContract, prior?: Transaction) {
  const p = provider instanceof BaseContract ? provider.runner?.provider : provider;
  if (!p) {
    throw new Error("No provider");
  }
  const fees = await p.getFeeData();
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
