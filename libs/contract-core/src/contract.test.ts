import { jest } from '@jest/globals';
import { ContractCore } from './contract';
import { describe } from '@thecointech/jestutils';
import { NormalizeAddress } from '@thecointech/utilities';
import { ifPolygonscan } from '@thecointech/secrets/jestutils';
import { getProvider } from '@thecointech/ethers-provider/Erc20Provider/web';

jest.setTimeout(60000);

describe('Testing provider', () => {

  it ('can fetch logs', async () => {

    const provider = await getProvider();
    const contract = await ContractCore.get(provider);

    const address = NormalizeAddress(process.env.WALLET_BrokerCAD_ADDRESS);
    const contractAddress = await contract.getAddress();

    const fromBlock = parseInt(process.env.INITIAL_COIN_BLOCK);
    const allTxs = await provider.getERC20History({address, contractAddress});
    const filter = contract.filters.Transfer(null, address);
    const logs1 = await contract.queryFilter(filter, fromBlock);
    const filter2 = contract.filters.Transfer(address, null);
    const logs2 = await contract.queryFilter(filter2, fromBlock);
    const logs = [...logs1, ...logs2];

    expect(logs.length).toEqual(allTxs.length);
    expect(logs[0].args.value).toEqual(allTxs[0].value);
  })

}, await ifPolygonscan("prod"));
