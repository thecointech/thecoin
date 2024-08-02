import { GetContract, TheCoin } from "@thecointech/contract-core";
import { getProvider } from "@thecointech/ethers-provider/Erc20Provider/web";
import { JsonRpcProvider } from 'ethers';

const address = '0x0AD357b1C8Ba6482a0fCe242BbeF5f3337dCC889';
const addresses = [undefined, address]
const contract = await GetContract();

const tryFetch = async (contract: TheCoin) => {
  const filter = contract.filters.ExactTransfer(...addresses);
  try {
    const logs = await contract.queryFilter(filter, 0);
    console.log("logs", logs.length);
  }
  catch (err: unknown) {
    console.log("error", err);
  }
}

await tryFetch(contract);
await tryFetch(contract.connect(getProvider()))
await tryFetch(contract.connect(new JsonRpcProvider("https://cloudflare-eth.com", process.env.DEPLOY_POLYGON_NETWORK)))
