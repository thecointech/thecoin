
import {GetContract} from './contract';
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getEnvVars } from "@thecointech/setenv";
import { NormalizeAddress } from '@thecointech/utilities';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';

const prodVars = getEnvVars('prodtest');
jest.setTimeout(1200000);

describe('Testing provider', () => {

  it ('can fetch logs', async () => {
    process.env.CONFIG_ENV = 'prodtest';
    process.env.DEPLOY_POLYGON_NETWORK = 'polygon-testnet';
    process.env.POLYGONSCAN_API_KEY = prodVars.POLYGONSCAN_API_KEY;

    const contract = GetContract();
    const provider = new Erc20Provider();

    const address = NormalizeAddress(prodVars.WALLET_BrokerCAD_ADDRESS);
    const contractAddress = contract.address;

    const allTxs = await provider.getERC20History({address, contractAddress});
    const filter = contract.filters.ExactTransfer(null, address);
    (filter as any).fromBlock = parseInt(prodVars.INITIAL_COIN_BLOCK);
    const logs1 = await provider.getEtherscanLogs(filter, "and");
    const filter2 = contract.filters.ExactTransfer(address, null);
    (filter2 as any).fromBlock = parseInt(prodVars.INITIAL_COIN_BLOCK);
    const logs2 = await provider.getEtherscanLogs(filter2, "and");
    const logs = [...logs1, ...logs2];

    expect(logs.length).toEqual(allTxs.length);
  })

  it ('fetches ERC20 txs', async () => {
    process.env.DEPLOY_POLYGON_NETWORK = 'polygon-testnet';
    const provider = new Erc20Provider();
    // const  h1 = await provider.getHistory('3043a245dc9f1a9574635e7ff1dea6ccffab8b92');

    const address = "0x123b38e9a9b3f75a8e16a4987eb5d7a524da6e56";
    const contractAddress = "0x244709f1811dec1305a2Ef50DcB12Ce6FFbef198"
    const contractHistory = await provider.getERC20History({ contractAddress });
    expect(contractHistory.length).toBeGreaterThan(0);

    const userHistory = await provider.getERC20History({address})
    expect(userHistory.length).toBeLessThan(contractHistory.length);

    const userContractHistory = await provider.getERC20History({address, contractAddress})
    expect(userContractHistory.length).toBeLessThan(userHistory);
  })

}, IsManualRun)
