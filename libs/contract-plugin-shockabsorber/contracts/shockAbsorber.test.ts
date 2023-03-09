import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import '@nomiclabs/hardhat-ethers';
import { ShockAbsorber } from '../src';
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core/*';
import { DateTime, Duration } from 'luxon';

jest.setTimeout(10 * 60 * 1000);
// beforeEach(async function () {
//   await hre.network.provider.send("hardhat_reset")
// })

const aYear = Duration.fromObject({year: 1}).as('seconds');
const aDay = Duration.fromObject({day: 1}).as('seconds');

const { absorber } = await setupAbsorber();

const maxCushionUp = 1.5 * 100_000_000_000 / 100; // 1.5%
const maxCushionDown = 50 * 100_000_000_000 / 100; // 50%
describe('It calculates the cushion reserve when all principal covered', () => {

  it.each([
    { rate: 100,   fiat: 5000e2, coin: 0 },
    { rate: 100.5, fiat: 5000e2, coin: 248756 },
    { rate: 101,   fiat: 5000e2, coin: 495049 },
    { rate: 101.5, fiat: 5000e2, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async ({ rate, coin, fiat }) => {

    const curr = rate * 50e2;
    const r = await absorber.calcCushionUp(5000e2, 50e6, curr, maxCushionUp);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr - reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });

});

describe('It calculates the cushion reserve when some principal covered', () => {

  it.each([
    { rate: 100,   fiat: 10000e2, coin: 0 },
    { rate: 100.5, fiat: 10025e2, coin: 248756 },
    { rate: 101,   fiat: 10050e2, coin: 495049 },
    { rate: 101.5, fiat: 10075e2, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 103, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async ({ rate, coin, fiat }) => {

    const curr = rate * 100e2;
    const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, maxCushionUp);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr - reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });
})

describe('It correctly reserves cushion over years', () => {

  it.each([
    { year: 1, rate: 100,   fiat: 10000e2, coin: 0 },
    { year: 1, rate: 101.5, fiat: 10075e2, coin: 738916 },
    // the cushion doesn't eat unprotected even over yeras
    { year: 2, rate: 101.5, fiat: 10075e2, coin: 738916 },
    // But it does add to cushion from prior years growth
    { year: 1, rate: 103, fiat: 10223_89, coin: 738916 },
    { year: 2, rate: 103, fiat: 10150e2, coin: 1456310 },
  ])(`with %s`, async ({ year, rate, coin, fiat }) => {

    const curr = rate * 100e2;
    const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, maxCushionUp * year);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr - reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });
})

describe('It correctly cushions entire principal on a drop', () => {
  it.each([
    { rate: 100,   fiat: 5000e2, coin: 0 },
    { rate: 99.9,  fiat: 5000e2, },
    { rate: 80,    fiat: 5000e2, },
    { rate: 50,    fiat: 5000e2, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async ({ rate, coin, fiat }) => {

    const curr = rate * 50e2;
    const r = await absorber.calcCushionDown(5000e2, 50e6, curr, maxCushionDown);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr + reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });
})

describe('It correctly cushions partial principal on a drop', () => {
  it.each([
    { rate: 100,   fiat: 10000e2, coin: 0 },
    { rate: 90,    fiat: 9500e2, },
    { rate: 50,    fiat: 7500e2, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async ({ rate, coin, fiat }) => {

    console.log("----------- Testing: rate", rate, "coin", coin, "fiat", fiat)
    const curr = rate * 100e2;
    const r = await absorber.calcCushionDown(10000e2, 100e6, curr, maxCushionDown);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr + reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });
})

// describe("It runs correcly live", async () => {

//   it ('runs correctly live', async () => {
//     const { absorber, client1, oracle, tcCore } = await setupTest(10_000);
//     await time.increase(aYear + aDay);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10850e2);

//     await absorber.drawDownCushion(client1.address);
//     await runAbsorber(absorber, absorber, oracle, tcCore, 101.5, 10850e2);
//     const balanceAb = await tcCore.balanceOf(absorber.address);
//     // $75 /110 = 6818181
//     expect(balanceAb.toNumber()).toEqual(681818);
//     // But the users balance doesn't actually change
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10850e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 10000e2);

//     // 3 more years, total reseerve is 75 * 5 = 375
//     await time.increase(aYear * 3);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
//     await absorber.drawDownCushion(client1.address);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);

//     // Check absorber balance
//     await runAbsorber(absorber, absorber, oracle, tcCore, 110, 10525e2);

//   })
// })
async function setupAbsorber(tcCoreAddress?: string, oracleAddress?: string) {
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber');
  const absorber = await ShockAbsorber.deploy();
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  await absorber.initialize(tcCoreAddress ?? zeroAddress, oracleAddress ?? zeroAddress);
  return { absorber };
}

// async function setupTest(initFiat: number) {
//   const { Owner, client1, OracleUpdater } = initAccounts(await hre.ethers.getSigners());
//   const tcCore = await createAndInitTheCoin(Owner);
//   const oracle = await createAndInitOracle(OracleUpdater, 100);

//   // pass $5000
//   const initCoin = initFiat * 1e6 / 100;
//   await tcCore.mintCoins(initCoin, Owner.address, Date.now());
//   await tcCore.transfer(client1.address, initCoin);

//   // Create plugin & assign user
//   await tcCore.pl_assignPlugin(client1.address, absorber.address, ALL_PERMISSIONS, "0x1234");

//   return { absorber, client1, oracle, tcCore };
// }

// const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number) => {
//   console.log(`------------------ Testing Price: ${price} ------------------`);
//   // Compensate for any changes to time in the tests calling this
//   const lastBlock = await hre.ethers.provider.getBlock("latest");
//   const currentValid = await oracle.validUntil();
//   const millisBetween = (1000 * lastBlock.timestamp) - currentValid.toNumber();
//   const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
//   const toAdvance = Math.max(1, Math.round(daysBetween));
//   // Set the new rate
//   await setOracleValueRepeat(oracle, price, toAdvance);
//   // Ensure that the block time is within lastest oracle block validity
//   const currentBlock = await hre.ethers.provider.getBlock("latest");
//   const currentTs = await oracle.validUntil();
//   const diff = Duration.fromMillis(currentTs.toNumber() - (currentBlock.timestamp * 1000));
//   // If block time is not within lastest oracle block validity, wait until it is
//   if (diff.as('days') > 1) {
//     await time.increaseTo(currentTs.div(1000).sub(3600));
//   }
//   // What does the client do?
//   const reportedCoin = await tcCore.pl_balanceOf(client1.address);
//   const currentFiat = await absorber['toFiat(int256,uint256)'](reportedCoin, currentTs.sub(3600_000));
//   // We may be 1c off due to rounding issues using int's everywhere
//   expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
// }
