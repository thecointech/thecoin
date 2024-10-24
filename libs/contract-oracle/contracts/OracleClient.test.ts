import { jest } from '@jest/globals';
import { createOracle } from "../internal/testHelpers";
import hre from 'hardhat';
import '@nomicfoundation/hardhat-ethers';
import { DateTime } from "luxon";
import { OracleClientTest__factory } from "../src/codegen";

jest.setTimeout(2 * 60 * 1000);

it ('rounds correctly', async () => {
  const [owner] = await hre.ethers.getSigners();
  const oracle = await createOracle(owner, 25);

  // Create client
  const Client: OracleClientTest__factory = await hre.ethers.getContractFactory('OracleClientTest');
  const client = await Client.deploy();
  await client.setOracle(oracle);

  // Starting value
  const setRate = async (rate: number) => {
    const initTime = await oracle.validUntil();
    await oracle.update(rate);
    return DateTime.fromMillis(Number(initTime));
  };

  {
    const coin = 33333333;
    let rate = 300027003;
    let currDate = await setRate(rate);

    for (let i = 0; i < 10; i++) {
      const testCoin = coin + i * 100;
      const jsFiat = testCoin * rate / 1e12;
      // Test rounding to
      const solFiatUU = await client["toFiat(uint256,uint256)"](testCoin, currDate.toMillis());
      expect(Math.round(jsFiat)).toEqual(Number(solFiatUU));
      const solFiatIU = await client["toFiat(int256,uint256)"](testCoin, currDate.toMillis());
      expect(Math.round(jsFiat)).toEqual(Number(solFiatIU));
    }
  }

  {
    const testFiat = 100_00;

    for (let i = 0; i < 10; i++) {
      const rate = 1000000 + i
      const currDate = await setRate(rate);

      const solrate = await client.getPrice(currDate.toMillis());
      const jsCoin = testFiat * 1e12 / rate;

      const solCoinUU = await client["toCoin(uint256,uint256)"](testFiat, currDate.toMillis());
      expect(Math.round(jsCoin)).toEqual(Number(solCoinUU));
      const solCoinIU = await client["toCoin(int256,uint256)"](testFiat, currDate.toMillis());
      expect(Math.round(jsCoin)).toEqual(Number(solCoinIU));
    }
  }
})
