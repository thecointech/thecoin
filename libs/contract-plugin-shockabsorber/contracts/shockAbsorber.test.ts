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
const FLOAT_FACTOR = 100_000_000_000;
const maxCushionUp = 0.015; //1.5 * FLOAT_FACTOR / 100; // 1.5%
const maxCushionDown = 0.5; //50 * FLOAT_FACTOR / 100; // 50%
const maxPrincipalCovered = 5000;
const maxCushionUpPercent = 1 - (1 / (1 + maxCushionUp)) //FLOAT_FACTOR - (FLOAT_FACTOR * FLOAT_FACTOR / (FLOAT_FACTOR + maxCushionUp));
const useJsTester = true;

const toCoin = (fiat: number, rate: number) => fiat / (rate / 1e6)
const toFiat = (coin: number, rate: number) => Math.round(100 * coin * (rate / 1e6)) / 100

const { absorber } = await setupAbsorber();

class AbsorberSol {
  fiatPrincipal = 5000;
  coinCurrent = 0;
  coinAdjustment = 0;

  constructor(fiatPrincipal: number) {
    this.fiatPrincipal = fiatPrincipal;
    this.coinCurrent = toCoin(fiatPrincipal, 100);
  }
  cushionUp = async (rate: number, year=1) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const r = await absorber.calcCushionUp(this.fiatPrincipal, Math.floor(coinPrincipal), this.coinCurrent, 0, year);
    return r.toNumber();
  };
  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const r = await absorber.calcCushionDown(this.fiatPrincipal, Math.floor(coinPrincipal), this.coinCurrent);
    return r.toNumber();
  };
}

class AbsorberJs  {
  fiatPrincipal = 5000;
  coinCurrent = 0;
  coinAdjustment = 0;

  constructor(fiatPrincipal: number) {
    this.fiatPrincipal = fiatPrincipal;
    this.coinCurrent = toCoin(fiatPrincipal, 100);
  }

  cushionUp = async (rate: number, year = 1) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);

    let percentCovered = maxPrincipalCovered / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);
    const coinCushion = this.coinCurrent - coinPrincipal;
    const coinMaxCushion = (maxCushionUpPercent * year) * this.coinCurrent;

    let coinCovered = coinCushion
    if (coinCushion> coinMaxCushion) {
      coinCovered = coinMaxCushion;
    }
    return Math.round(coinCovered * percentCovered);
  };

  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);

    // Duplicate of contract calcCushionDown for debugging purposes
    let percentCovered = maxPrincipalCovered / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);
    const maxCushionCoin = this.coinCurrent / (1 - maxCushionDown);
    const coinCovered = Math.min(maxCushionCoin, coinPrincipal)
    return Math.round(percentCovered * (coinCovered - this.coinCurrent));
  }

  balanceOf = async (rate: number, year=1) => {
    // toCoin
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);

    if (coinPrincipal < this.coinCurrent) {
      // In Profit, run CushionUp
      const reserveCushion = await this.cushionUp(rate, year);
      return this.coinCurrent - reserveCushion;
    }
    else if (this.coinCurrent < coinPrincipal) {
      // In Loss, run CushionDown
      const addCushion = await this.cushionDown(rate);
      return this.coinCurrent + addCushion;
    }
    return this.coinCurrent;
  }
}
const createTester = (fiatPrincipal: number) => {
  return useJsTester
    ? new AbsorberJs(fiatPrincipal)
    : new AbsorberSol(fiatPrincipal);
}
type Results = {
  rate: number,
  fiat?: number,
  coin?:number,
  year?: number,
}
type Tester = ReturnType<typeof createTester>;
const testResults = async (tester: Tester, results: Results, up: boolean) => {
  const r = up
    ? await tester.cushionUp(results.rate, results.year)
    : await tester.cushionDown(results.rate);
  const fiatCurrent = toFiat(tester.coinCurrent, results.rate);
  if (results.fiat) {
    // Assert that the amount reserved does not take balance below reserve
    const reserved = toFiat(r, results.rate);
    expect(up
      ? fiatCurrent - reserved
      : fiatCurrent + reserved).toEqual(results.fiat);
  }
  if (results.coin) {
    // This odd-looking comparison allows differences of 1,
    // to account for rounding in JS vs Sol, but still
    // keep a proper error message on failure
    if (Math.abs(r - results.coin) != 1) {
      expect(r).toEqual(results.coin);
    }
  }
}
const testUpResult = async (tester: Tester, results: Results) => testResults(tester, results, true);
const testDownResult = async (tester: Tester, results: Results) => testResults(tester, results, false);

///////////////////////////////////////////////////////////////////////////
// Actual tests here
///////////////////////////////////////////////////////////////////////////

describe('cushionUp with principal covered', () => {

  const tester = createTester(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 100.5, fiat: 5000, coin: 248757 },
    { rate: 101,   fiat: 5000, coin: 495050 },
    { rate: 101.5, fiat: 5000, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testUpResult(tester, inputs));
});

describe('cushionUp with partial principal covered', () => {
  const tester = createTester(10000);

  it.each([
    { rate: 100,   fiat: 10000, coin: 0 },
    { rate: 100.5, fiat: 10025, coin: 248756 },
    { rate: 101,   fiat: 10050, coin: 495050 },
    { rate: 101.5, fiat: 10075, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 103, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testUpResult(tester, inputs));
})

describe('cushionUp over years', () => {
  const tester = createTester(10000);
  it.each([
    { year: 1, rate: 100,   fiat: 10000, coin: 0 },
    { year: 1, rate: 101.5, fiat: 10075, coin: 738916 },
    // the cushion doesn't eat unprotected even over yeras
    { year: 2, rate: 101.5, fiat: 10075, coin: 738916 },
    // But it does add to cushion from prior years growth
    { year: 1, rate: 103, fiat: 10223.89, coin: 738916 },
    // NOTE: Less cushion is reserved in the following year
    // (in coin) due to the higher rate.
    { year: 2, rate: 103, fiat: 10150, coin: 1456311 },
  ])(`with %s`, async (inputs) => testUpResult(tester, inputs));
})

describe('cushionDown with principal covered', () => {
  const tester = createTester(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 99.9,  fiat: 5000, },
    { rate: 80,    fiat: 5000, },
    { rate: 50,    fiat: 5000, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async (inputs) => testDownResult(tester, inputs));
})

// describe('cushionDown with principal partially covered', () => {
//   it.each([
//     { rate: 100,   fiat: 10000e2, coin: 0 },
//     { rate: 90,    fiat: 9500e2, },
//     { rate: 50,    fiat: 7500e2, coin: 50e6},
//     // After this point, the cushion is expended
//     { rate: 49.9, coin: 50e6 },
//     { rate: 30, coin: 50e6 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     console.log("----------- Testing: rate", rate, "coin", coin, "fiat", fiat)
//     const curr = rate * 100e2;
//     const coinPrincipal = toCoin(10000, rate);
//     const r = await cushionDown(10000e2, coinPrincipal, 100e6);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr + reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('cushionUp after drawDown', () => {
//   it.each([
//     { year: 1, rate: 100,   fiat: 10000e2, coin: 0 },
//     { year: 1, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     { year: 2, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     { year: 2, rate: 103, fiat: 10150e2, coin: 1456310 },
//   ])(`with %s`, async ({ year, rate, coin, fiat }) => {

//     const currCoin = 100e6;
//     const currFiat = rate * currCoin / 1e4;
//     const coinPrincipal = toCoin(10000, rate);
//     const r = year > 1
//       ? await cushionUp(10000e2, coinPrincipal, currCoin, 738916, year - 1)
//       : await cushionUp(10000e2, coinPrincipal, currCoin);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(currFiat - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })
// //////////////////////////////////////////////////////////////////////

// describe('It calculates the cushion reserve when all principal covered', () => {

//   it.each([
//     { rate: 100,   fiat: 5000e2, coin: 0 },
//     { rate: 100.5, fiat: 5000e2, coin: 248756 },
//     { rate: 101,   fiat: 5000e2, coin: 495050 },
//     { rate: 101.5, fiat: 5000e2, coin: 738916 },
//     // After this point, the cushion is full and stops growing
//     { rate: 102, coin: 738916 },
//     { rate: 105, coin: 738916 },
//     { rate: 115, coin: 738916 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const curr = rate * 50e2;
//     const coinPrincipal = toCoin(5000, rate);
//     const r = await absorber.calcCushionUp(5000e2, coinPrincipal, 50e6, 0, 1);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });

// });

// describe('It calculates the cushion reserve when some principal covered', () => {

//   it.each([
//     { rate: 100,   fiat: 10000e2, coin: 0 },
//     { rate: 100.5, fiat: 10025e2, coin: 248756 },
//     { rate: 101,   fiat: 10050e2, coin: 495050 },
//     { rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // After this point, the cushion is full and stops growing
//     { rate: 102, coin: 738916 },
//     { rate: 103, coin: 738916 },
//     { rate: 105, coin: 738916 },
//     { rate: 115, coin: 738916 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const curr = rate * 100e2;
//     const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, 0, maxCushionUp);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly reserves cushion over years', () => {

//   it.each([
//     { year: 1, rate: 100,   fiat: 10000e2, coin: 0 },
//     { year: 1, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // the cushion doesn't eat unprotected even over yeras
//     { year: 2, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // But it does add to cushion from prior years growth
//     { year: 1, rate: 103, fiat: 10223_89, coin: 738916 },
//     // NOTE: Less cushion is reserved in the following year
//     // (in coin) due to the higher percentage affecting the rate.
//     // THIS IS PROBABLY NOT WHAT WE WANT.
//     // The cushion reserve should be constant
//     { year: 2, rate: 103, fiat: 10150e2, coin: 1456310 },
//   ])(`with %s`, async ({ year, rate, coin, fiat }) => {

//     const curr = rate * 100e2;
//     const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, 0, maxCushionUp * year);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly cushions entire principal on a drop', () => {
//   it.each([
//     { rate: 100,   fiat: 5000e2, coin: 0 },
//     { rate: 99.9,  fiat: 5000e2, },
//     { rate: 80,    fiat: 5000e2, },
//     { rate: 50,    fiat: 5000e2, coin: 50e6},
//     // After this point, the cushion is expended
//     { rate: 49.9, coin: 50e6 },
//     { rate: 30, coin: 50e6 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const fiatCurrent = rate * 50e2;
//     const coinPrincipal = toCoin(5000, rate);
//     const r = await absorber.calcCushionDown(5000e2, coinPrincipal, 50e6);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(fiatCurrent + reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly cushions partial principal on a drop', () => {
//   it.each([
//     { rate: 100,   fiat: 10000e2, coin: 0 },
//     { rate: 90,    fiat: 9500e2, },
//     { rate: 50,    fiat: 7500e2, coin: 50e6},
//     // After this point, the cushion is expended
//     { rate: 49.9, coin: 50e6 },
//     { rate: 30, coin: 50e6 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     console.log("----------- Testing: rate", rate, "coin", coin, "fiat", fiat)
//     const coinPrincipal = toCoin(10000, rate);
//     const fiatCurrent = rate * 100e2;
//     const r = await absorber.calcCushionDown(10000e2, coinPrincipal, 100e6);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(fiatCurrent + reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe("It runs correcly live", () => {

//   it ('runs correctly live', async () => {
//     const { absorber, client1, oracle, tcCore } = await setupLive(10_000);
//     const started = await absorber.msNow();
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10918_71);
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);

//     await time.increase(aYear + aDay);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10839_80);

//     // Draw down the first years cushion
//     const msNow = await absorber.msNow();
//     await absorber.drawDownCushion(client1.address);
//     // Should increase the contracts balance
//     const balanceAb = await tcCore.balanceOf(absorber.address);
//     // $75 @ 101.5 = 738916
//     expect(balanceAb.toNumber()).toEqual(738916);
//     // But the users balance doesn't (shouldn') actually change
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10838_03);
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 10000e2);

//     // 3 more years, total reseerve is 75 * 5 = 375
//     await time.increase(aYear * 3);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
//     await absorber.drawDownCushion(client1.address);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
//   })
// })

async function setupAbsorber(tcCoreAddress?: string, oracleAddress?: string) {
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber');
  const absorber = await ShockAbsorber.deploy();
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  await absorber.initialize(tcCoreAddress ?? zeroAddress, oracleAddress ?? zeroAddress);
  return { absorber };
}

async function setupLive(initFiat: number) {
  const { Owner, client1, OracleUpdater } = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(Owner);
  const oracle = await createAndInitOracle(OracleUpdater, 100);
  const {absorber} = await setupAbsorber(tcCore.address, oracle.address);

  // pass $5000
  const initCoin = initFiat * 1e6 / 100;
  await tcCore.mintCoins(initCoin, Owner.address, Date.now());
  await tcCore.transfer(client1.address, initCoin);

  // Create plugin & assign user
  await tcCore.pl_assignPlugin(client1.address, absorber.address, ALL_PERMISSIONS, "0x1234");

  return { absorber, client1, oracle, tcCore };
}

const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number) => {
  console.log(`------------------ Testing Price: ${price} ------------------`);
  // Compensate for any changes to time in the tests calling this
  const lastBlock = await hre.ethers.provider.getBlock("latest");
  const currentValid = await oracle.validUntil();
  const millisBetween = (1000 * lastBlock.timestamp) - currentValid.toNumber();
  const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
  const toAdvance = Math.max(1, Math.round(daysBetween));
  // Set the new rate
  await setOracleValueRepeat(oracle, price, toAdvance);
  // Ensure that the block time is within lastest oracle block validity
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  const currentTs = await oracle.validUntil();
  const diff = Duration.fromMillis(currentTs.toNumber() - (currentBlock.timestamp * 1000));
  // If block time is not within lastest oracle block validity, wait until it is
  if (diff.as('days') > 1) {
    await time.increaseTo(currentTs.div(1000).sub(3600));
  }
  // What does the client do?
  const reportedCoin = await tcCore.pl_balanceOf(client1.address);
  const currentFiat = await absorber['toFiat(int256,uint256)'](reportedCoin, currentTs.sub(3600_000));
  // We may be 1c off due to rounding issues using int's everywhere
  expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
}
