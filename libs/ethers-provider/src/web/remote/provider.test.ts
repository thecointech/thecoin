import { getEnvVars } from '@thecointech/setenv';
import { Erc20Provider } from '.';
import { describe } from '@thecointech/jestutils';

const prodVars = getEnvVars('prodtest');

describe('manual test', () => {

  const OLD_ENV = process.env;
  beforeEach(() => process.env = prodVars);
  afterAll(() => process.env = OLD_ENV);

  const address = "0x123b38e9a9b3f75a8e16a4987eb5d7a524da6e56";
  const contractAddress = "0x244709f1811dec1305a2Ef50DcB12Ce6FFbef198"

  it("reads ERC20 txs", async () => {
    const provider = new Erc20Provider();

    const contractHistory = await provider.getERC20History({ contractAddress });
    expect(contractHistory.length).toBeGreaterThan(0);

    const userHistory = await provider.getERC20History({address});
    const userHistoryForContract = userHistory.filter(u => u.contractAddress == contractAddress);
    expect(userHistoryForContract.length).toBeLessThan(contractHistory.length);

    const userContractHistory = await provider.getERC20History({address, contractAddress})
    expect(userContractHistory.length).toBe(userHistoryForContract.length);
  })

  it("getERC20History respects from/to blocks", async () => {
    const provider = new Erc20Provider();

    const contractHistory = await provider.getERC20History({
      contractAddress,
      fromBlock: 21546158,
      toBlock: 21546188
    });
    expect(contractHistory.length).toEqual(10);
  });

  it("getEtherscanLogs respects from/to blocks", async () => {
    const provider = new Erc20Provider();

    const filter = {
      fromBlock: 22455908,
      toBlock: 22455993,
      address: "0x0bfa8727e25E5dBAB2483712BAa6b27dbE3710CA",
      topics: [ // ExactTransfer(from, BrokerCAD)
        "0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75",
        "0x000000000000000000000000d86c97292b9be3a91bd8279f114752248b80e8c5",
        "0x000000000000000000000000123b38e9a9b3f75a8e16a4987eb5d7a524da6e56"
      ]
    }

    const contractHistoryAnd = await provider.getEtherscanLogs(filter, "and");
    expect(contractHistoryAnd.length).toEqual(10);

    const contractHistoryOr = await provider.getEtherscanLogs(filter, "or");
    expect(contractHistoryOr.length).toEqual(37);
  });
}, prodVars.POLYGONSCAN_API_KEY != undefined)
