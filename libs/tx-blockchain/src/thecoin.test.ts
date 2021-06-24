import { cadbrokerIn, cadbrokerOut, fetchCoinHistory } from "./thecoin";
import { BigNumber } from "ethers/utils";
import { GetContract } from "@thecointech/contract";
import { describe, IsManualRun } from '@thecointech/jestutils';

//
// Easy-to-debug fetch of all history
describe("Fetch live data", () => {
  it('Can fetch TheCoin history', async () => {
    jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
    process.env.CONFIG_NAME='prod';
    const contract = await GetContract();
    const history = await fetchCoinHistory(contract);

    const balanceOut = await contract.balanceOf(cadbrokerOut) as BigNumber;
    const balanceIn = await contract.balanceOf(cadbrokerIn) as BigNumber;
    const balance = balanceOut.add(balanceIn);

    expect(history[0].balance).toBe(history[0].change);
    expect(history[history.length - 1].balance).toBe(balance.toNumber());
  })
}, IsManualRun);
