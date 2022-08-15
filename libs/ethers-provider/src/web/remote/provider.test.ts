import { getEnvVars } from '@thecointech/setenv';
import { Erc20Provider } from '.';
import { describe } from '@thecointech/jestutils';

const prodVars = getEnvVars('prodtest');

describe('manual test', () => {

  const OLD_ENV = process.env;
  beforeEach(() => process.env = prodVars);
  afterAll(() => process.env = OLD_ENV);

  it("reads ERC20 txs", async () => {
    const provider = new Erc20Provider();

    const address = "0x123b38e9a9b3f75a8e16a4987eb5d7a524da6e56";
    const contractAddress = "0x244709f1811dec1305a2Ef50DcB12Ce6FFbef198"
    const contractHistory = await provider.getERC20History({ contractAddress });
    expect(contractHistory.length).toBeGreaterThan(0);

    const userHistory = await provider.getERC20History({address});
    const userHistoryForContract = userHistory.filter(u => u.contractAddress == contractAddress);
    expect(userHistoryForContract.length).toBeLessThan(contractHistory.length);

    const userContractHistory = await provider.getERC20History({address, contractAddress})
    expect(userContractHistory.length).toBe(userHistoryForContract.length);
  })
}, prodVars.POLYGONSCAN_API_KEY != undefined)
