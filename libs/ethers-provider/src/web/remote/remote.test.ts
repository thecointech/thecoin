import { jest } from '@jest/globals';
import { getEnvVars } from '@thecointech/setenv';
import { describe } from '@thecointech/jestutils';
import { getProvider } from './index';

const contractAddress = "0x34fA894d7fE1FA5FA9d109434345B47DBe3B01fc"
const fromBlock = 22371135;
const toBlock = 22371952;

const oldEnv = process.env;
const setEnv = (env: string) => {
  process.env = {
    ...oldEnv,
    ...getEnvVars(env)
  };
}

jest.setTimeout(60000);
describe('Web Remote provider', () => {
  it ('Connects to testnet', async () => {
    setEnv('prodtest');
    const provider = getProvider();
    expect(provider.network.name).toEqual("matic-amoy");
    // Try a connection
    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBeGreaterThan(0);

    // Fetch logs
    // const logs = await provider.getERC20History("0x34fA894d7fE1FA5FA9d109434345B47DBe3B01fc");
  })

  it ('Connects to mainnet', async () => {
    setEnv('prod');
    const provider = getProvider();
    expect(provider.network.name).toEqual("matic");
    // Try a connection
    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBeGreaterThan(0);

    const tx = await provider.getTransaction("0x9955dc2f4173162223b855adeeaeac1861e07a7f9d076e82a14f678ec2d6255e");
    expect(tx.chainId).toEqual(137n);
  })

  it ('fetches ERC20 history', async () => {
    // Fetch logs
    setEnv('prod');
    const provider = getProvider();
    const logs = await provider.getERC20History({
      address: process.env.WALLET_BrokerCAD_ADDRESS,
      contractAddress,
      fromBlock,
      toBlock
    });
    expect(logs.length).toEqual(10);
    expect(logs[0].timestamp).toBe(1639169941);
  })

  it ('fetches logs from Etherscan', async () => {
    // Fetch logs
    setEnv('prod');
    const provider = getProvider();
    const logsFrom = await provider.getLogs({
      address: contractAddress,
      fromBlock,
      toBlock,
      topics: [
        "0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75",
        null,
        "0x0000000000000000000000002fe3cbf59a777e8f4be4e712945ffefc6612d46f"
      ],
    })
    const logsTo = await provider.getLogs({
      address: contractAddress,
      fromBlock,
      toBlock,
      topics: [
        "0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75",
        "0x0000000000000000000000002fe3cbf59a777e8f4be4e712945ffefc6612d46f"
      ],
    })

    expect(logsFrom.length).toEqual(4);
    // This should be the same as GetERC20History results
    expect(logsFrom.length + logsTo.length).toEqual(10);
})
}, !!process.env.THECOIN_ENVIRONMENTS)
