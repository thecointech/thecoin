import { getEnvVars } from '@thecointech/setenv';
import { describe } from '@thecointech/jestutils';
import { getProvider } from './remote';

describe('Node Remote provider', () => {
  const oldEnv = process.env;
  it ('Connects to testnet', async () => {
    process.env = {
      ...oldEnv,
      ...getEnvVars('prodtest')
    };
    const provider = getProvider();
    expect(provider._network.name).toEqual("matic-amoy");
    // Try a connection
    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBeGreaterThan(0);
  })

  it ('Connects to mainnet', async () => {
    process.env = {
      ...oldEnv,
      ...getEnvVars('prod')
    };
    const provider = getProvider();
    expect(provider._network.name).toEqual("matic");
    // Try a connection
    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBeGreaterThan(0);

     // Fetch logs
     const logs = await provider.getLogs({
      address: "0x34fA894d7fE1FA5FA9d109434345B47DBe3B01fc",
      topics: [
        "0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75",
        null,
        "0x0000000000000000000000002fe3cbf59a777e8f4be4e712945ffefc6612d46f"
      ],
      fromBlock: 22371135,
      toBlock: 22371952
    });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].topics[2]).toContain("2fe3cbf59a777e8f4be4e712945ffefc6612d46f");
  })
}, !!process.env.THECOIN_ENVIRONMENTS)
