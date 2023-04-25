import { BigNumber } from '@ethersproject/bignumber';
import type { Provider } from '@ethersproject/abstract-provider';
import type { Signer } from '@ethersproject/abstract-signer';
import type { AccountName } from '@thecointech/signers';
import hre from 'hardhat';

const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

// HACK
// This is a temp hack to fix
// https://github.com/ethers-io/ethers.js/issues/2828
// (has to be done this way because)
// https://forum.openzeppelin.com/t/how-to-set-gaslimit-and-gasprice-with-hardhat-upgrades-plugin/28279/2
// It's only used in deployment, and can probably be reverted when we move to ethers:v6
export async function getOverrideFees(provider: Provider) {
  const fees = await provider.getFeeData();
  if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) {
    throw new Error("Fee data not available");
  };

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

export async function getDeploySigner(owner: AccountName) {
  // First, verify we are deploying to the right network.
  if (hre.network.config.chainId?.toString() !== process.env.DEPLOY_POLYGON_NETWORK_ID) {
    throw new Error('Missmatched ChainIDs');
  }

  const { getSigner } = await eval("import('@thecointech/signers')");
  const { getProvider } = await eval("import('@thecointech/ethers-provider')");

  const base = await getSigner(owner) as Signer
  // In devlive, the signers come pre-connected
  if (process.env.NODE_ENV !== "production") {
    return base;
  }

  const provider: any = getProvider();
  // We can't actually use async here because the
  // provider is compiled without async support
  const fees = await getOverrideFees(provider);
  provider.getFeeData = async () => {
    // const fees = await getOverrideFees(this);
    return fees;
  }
  provider.__youShouldSeeThis = "You should see this";
  return base.connect(provider);
}
