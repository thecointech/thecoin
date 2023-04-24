import { BigNumber } from '@ethersproject/bignumber';
import type { Provider } from '@ethersproject/abstract-provider';

const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

// HACK
// This is a temp hack to fix
// https://github.com/ethers-io/ethers.js/issues/2828
// (has to be done this way because)
// https://forum.openzeppelin.com/t/how-to-set-gaslimit-and-gasprice-with-hardhat-upgrades-plugin/28279/2
// It's only used in deployment, and can probably be reverted when we move to ethers:v6
export async function getOverrideFees(provider: Provider) {
  const fees = await provider.getFeeData();
  if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) return undefined;

  // calculate new maximums at least 10% higher than previously
  const base = fees.maxFeePerGas.sub(fees.maxPriorityFeePerGas);
  const newMinimumTip = MinimumBloodsuckerFee;
  const tip = Math.max(fees.maxPriorityFeePerGas.toNumber(), newMinimumTip);
  return {
    maxFeePerGas: base.mul(2).add(tip),
    maxPriorityFeePerGas: BigNumber.from(tip),
    gasPrice: fees.gasPrice,
  }
}
