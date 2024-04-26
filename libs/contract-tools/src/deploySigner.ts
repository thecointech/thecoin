import type { AccountName } from '@thecointech/signers';
import { Signer } from 'ethers';
import hre from 'hardhat';

// HACK
// This is a temp hack to fix
// https://github.com/ethers-io/ethers.js/issues/2828
// (has to be done this way because)
// https://forum.openzeppelin.com/t/how-to-set-gaslimit-and-gasprice-with-hardhat-upgrades-plugin/28279/2
// It's only used in deployment, and can probably be reverted when we move to ethers:v6

export async function getDeploySigner(owner: AccountName) {
  // First, verify we are deploying to the right network.
  const chainId = hre.network.config.chainId;
  const deployId = process.env.DEPLOY_POLYGON_NETWORK_ID;
  if (chainId?.toString() != deployId?.toString()) {
    throw new Error(`Missmatched ChainIDs: ${chainId} != ${deployId}`);
  }

  const { getSigner } = await eval("import('@thecointech/signers')");
  const { getProvider } = await eval("import('@thecointech/ethers-provider')");

  const base = await getSigner(owner) as Signer
  // In devlive, the signers come pre-connected
  if (process.env.NODE_ENV !== "production") {
    return base;
  }

  debugger;
  const provider = getProvider();
  // We can't actually use async here because the
  // provider is compiled without async support
  // const fees = await getOverrideFees(provider);
  // provider.getFeeData = async () => {
  //   // const fees = await getOverrideFees(this);
  //   return fees;
  // }
  return base.connect(provider);
}
