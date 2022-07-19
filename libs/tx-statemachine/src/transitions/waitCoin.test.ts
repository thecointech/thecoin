
import { updateCoinBalance } from "./waitCoin";
import { getEnvVars } from "@thecointech/setenv";
import { GetContract } from '@thecointech/contract-core/contract';
import { InfuraProvider } from "@ethersproject/providers";
import { NormalizeAddress } from '@thecointech/utilities';
import { AnyActionContainer } from '..';
import { Decimal } from "decimal.js-light";
import { describe } from '@thecointech/jestutils'

const vars = getEnvVars("prodtest");
const getContainer = async (addr: string, coin?: Decimal) => ({
  history: [{
    data: { coin }
  }],
  action: {
    address: NormalizeAddress(addr)
  },
  contract: (await GetContract()).connect(new InfuraProvider("maticmum", process.env.INFURA_PROJECT_ID))
} as AnyActionContainer)

describe("Blockchain check operations", () => {

  it("correctly updates withdraw value", async () => {

    process.env = vars;
    // We really need a nicer way to un-mock our contracts etc.
    const hash = "0x0c133df129bda55750710ccd4f1e4cf17d08d4f27c9f79a33bec55fa2b03a3f9";
    const container = await getContainer("0x0b8343eecf572c81bcaba8e27285e40a55496e5d");
    const receipt = await container.contract.provider.waitForTransaction(hash, 0);

    const balance = updateCoinBalance(container, receipt)
    expect(balance.eq(446826763)).toBeTruthy();
  })

  it("currectly updates deposit value", async () => {

    process.env = vars;
    // We really need a nicer way to un-mock our contracts etc.
    const hash = "0x34d1bd18bfda8f79e8f790fef4103a8bc73852ecf285e486264cb50004e57f3f";
    const container = await getContainer("0x4d397e03e28b6041d8bc559debdc1742d33f59ad", new Decimal(475961968));
    const receipt = await container.contract.provider.waitForTransaction(hash, 0);
    const balance = updateCoinBalance(container, receipt)
    expect(balance.eq(0)).toBeTruthy();
  })

}, !!vars.INFURA_PROJECT_ID)
