import { jest } from '@jest/globals';
import { GetContract } from './contract';
import { describe } from '@thecointech/jestutils';
import { getEnvVars } from "@thecointech/setenv";
import { NormalizeAddress } from '@thecointech/utilities';
import { IfPolygonscanLive } from '@thecointech/secrets/jestutils';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider/web';

const prodVars = getEnvVars('prod');
jest.setTimeout(60000);

describe('Testing provider', () => {

  const OLD_ENV = process.env;
  beforeEach(() => process.env = prodVars);
  afterAll(() => process.env = OLD_ENV);

  it ('can fetch logs', async () => {

    const provider = new Erc20Provider();
    const contract = await GetContract(provider);

    const address = NormalizeAddress(prodVars.WALLET_BrokerCAD_ADDRESS);
    const contractAddress = await contract.getAddress();

    const fromBlock = parseInt(prodVars.INITIAL_COIN_BLOCK);
    const allTxs = await provider.getERC20History({address, contractAddress});
    const filter = contract.filters.Transfer(null, address);
    const logs1 = await contract.queryFilter(filter, fromBlock);
    const filter2 = contract.filters.Transfer(address, null);
    const logs2 = await contract.queryFilter(filter2, fromBlock);
    const logs = [...logs1, ...logs2];

    expect(logs.length).toEqual(allTxs.length);
    expect(logs[0].args.value).toEqual(allTxs[0].value);
  })

}, await IfPolygonscanLive());
