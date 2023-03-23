
import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import '@nomiclabs/hardhat-ethers';
import { ShockAbsorber } from '../src';
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core';
import { Duration } from 'luxon';
import { getSigner } from '@thecointech/signers';

const FLOAT_FACTOR = 100_000_000_000;
export const yearInMs = 31556952_000;
const maxCushionUp = 0.015; //1.5 * FLOAT_FACTOR / 100; // 1.5%
const maxCushionDown = 0.5; //50 * FLOAT_FACTOR / 100; // 50%
const maxPrincipalCovered = 5000;
const maxCushionUpPercent = 1 - (1 / (1 + maxCushionUp)) //FLOAT_FACTOR - (FLOAT_FACTOR * FLOAT_FACTOR / (FLOAT_FACTOR + maxCushionUp));

export const toCoin = (fiat: number, rate: number) => fiat / (rate / 1e6)
export const toFiat = (coin: number, rate: number) => Math.round(100 * coin * (rate / 1e6)) / 100

const { absorber } = await setupAbsorber();

class AbsorberSol {
  fiatPrincipal = 5000;
  coinCurrent = 0;
  coinAdjustment = 0;
  maxCovered = 0;
  reserved = 0;

  constructor(fiatPrincipal: number) {
    this.fiatPrincipal = fiatPrincipal;
    this.coinCurrent = toCoin(fiatPrincipal, 100);
  }
  cushionUp = async (rate: number, year=1) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const r = await absorber.calcCushionUp(this.fiatPrincipal * 100, Math.floor(coinPrincipal), this.coinCurrent, 0, year);
    return r.toNumber();
  };
  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const r = await absorber.calcCushionDown(this.fiatPrincipal * 100, Math.floor(coinPrincipal), this.coinCurrent);
    return r.toNumber();
  };

  deposit = async (fiat: number, timeMs: number) => {;
  };

  withdraw = async (fiat: number, timeMs: number) => {
  }

  getAvgFiatPrincipal = async (timeMs: number) => {
    return 0;
  }

  drawDownCushion = async (rate: number, year=1) => {
    // TODO:
    const client1 = await getSigner("client1")
    await absorber.drawDownCushion(await client1.getAddress());
  }
}

class AbsorberJs  {
  fiatPrincipal = 5000;
  coinCurrent = 0;
  // coinAdjustment = 0;
  lastDrawDownTime = 0;

  avgFiatPrincipal = 0;
  avgCoinPrincipal = 0;
  lastAvgAdjustTime = 0;

  reserved = 0;
  maxCovered = 0;
  maxCoverAdjust = 0;

  constructor(fiatPrincipal: number) {
    this.fiatPrincipal = fiatPrincipal;
    this.coinCurrent = toCoin(fiatPrincipal, 100);
    this.maxCovered = this.coinCurrent / (1 - maxCushionDown);
  }

  getMaxPercentCushion = (timeMs: number) => 1 - (1 / (1 + maxCushionUp * (timeMs / yearInMs)))

  cushionUp = async (rate: number, year = 1) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const coinOriginal = this.coinCurrent + this.reserved;

    let percentCovered = maxPrincipalCovered / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);
    const maxPercentCushion = this.getMaxPercentCushion(year * yearInMs);
    const coinMaxCushion = maxPercentCushion * coinOriginal;

    const coinCushion = coinOriginal - coinPrincipal;
    let coinCovered = coinCushion
    if (coinCushion > coinMaxCushion) {
      coinCovered = coinMaxCushion;
    }
    return Math.round(coinCovered * percentCovered) - this.reserved;
  };

  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const coinOriginal = this.coinCurrent + this.reserved;

    let percentCovered = maxPrincipalCovered / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);

    const maxCushionCoin = this.maxCovered; //coinOriginal / (1 - maxCushionDown);
    const coinCovered = Math.min(maxCushionCoin, coinPrincipal)

    const target = percentCovered * coinCovered;
    const original = percentCovered * coinOriginal - this.reserved;
    return Math.round(target - original);
  }

  balanceOf = async (rate: number, year=1) => {
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
  };

  deposit = async (fiat: number, rate: number, timeMs: number) => {

    const coinDeposit = toCoin(fiat, rate);
    let depositRatio = (fiat / this.fiatPrincipal) / (coinDeposit / (this.maxCovered * maxCushionDown));

    this.avgFiatPrincipal += this.getAnnualizedValue(timeMs, this.fiatPrincipal);
    this.avgCoinPrincipal += this.getAnnualizedValue(timeMs, this.coinCurrent);
    this.fiatPrincipal += fiat;
    this.coinCurrent += coinDeposit;

    let maxCoverAdjust = (1 - depositRatio) * coinDeposit / (1 - maxCushionDown)
    let maxCoverForCoin = coinDeposit / (1 - maxCushionDown);

    // NOTE TO SELF:
    // I kinda wrote this in a week-long haze of fatigue, caffeine, and alcohol,
    // and I really have no idea what it actually does.
    // The tests all pass though, so... yay me, I guess?
    // It's very likely it could be greatly optimized though...

    // In profit
    if (maxCoverAdjust < 0 && maxCoverForCoin > this.maxCoverAdjust) {
      // If adjusting for a withdrawal on loss
      if (this.maxCoverAdjust > 0) {
        this.maxCovered += maxCoverForCoin - maxCoverAdjust;
        this.maxCoverAdjust += maxCoverAdjust;
      }
      // Else eliminate adjustments for a withdrawal on profit
      else {
        this.maxCovered += maxCoverForCoin - this.maxCoverAdjust;
        this.maxCoverAdjust = 0;
      }
    }
    else {
      if (maxCoverForCoin > this.maxCoverAdjust) {
        maxCoverForCoin -= Math.min(maxCoverAdjust, this.maxCoverAdjust);
        this.maxCoverAdjust -= Math.min(maxCoverAdjust, this.maxCoverAdjust);
      } else {
        this.maxCoverAdjust -= maxCoverAdjust;
      }
      this.maxCovered += maxCoverForCoin;
    }

    this.lastAvgAdjustTime = timeMs;
  };

  withdraw = async (fiat: number, rate: number, timeMs: number) => {
    let coinWithdraw = toCoin(fiat, rate);
    let withdrawRatio = (fiat / this.fiatPrincipal) / (coinWithdraw / (this.maxCovered * maxCushionDown));

    if (this.coinCurrent < coinWithdraw) {
      // In Loss, run CushionDown
      const additionalRequired = coinWithdraw - this.coinCurrent;
      const maxCushion = await this.cushionDown(rate);
      if (additionalRequired > maxCushion) {
        throw new Error("Insufficient funds");
      }
      else {
        // in contract, transfer additionalRequired to this users account
        this.coinCurrent += additionalRequired;
      }
    }

    this.avgFiatPrincipal += this.getAnnualizedValue(timeMs, this.fiatPrincipal);
    this.avgCoinPrincipal += this.getAnnualizedValue(timeMs, this.coinCurrent);
    this.fiatPrincipal -= fiat;
    this.lastAvgAdjustTime = timeMs;
    this.coinCurrent -= coinWithdraw;

    this.maxCoverAdjust += (1 - withdrawRatio) * coinWithdraw / (1 - maxCushionDown);
    this.maxCovered -= withdrawRatio * coinWithdraw / (1 - maxCushionDown);
    return coinWithdraw;
  }

  getAnnualizedValue = (timeMs: number, value: number) => {
    const percentOfYear = (timeMs - this.lastAvgAdjustTime) / yearInMs;
    const annualizedAvg = value * percentOfYear;
    return Math.max(annualizedAvg, 0);
  }
  getAvgFiatPrincipal = async (timeMs: number) => {
    return this.avgFiatPrincipal + this.getAnnualizedValue(timeMs, this.fiatPrincipal);
  }
  getAvgCoinBalance = async (timeMs: number) => {
    return this.avgCoinPrincipal + this.getAnnualizedValue(timeMs, this.coinCurrent);
  }

  drawDownCushion = async (timeMs: number) => {
    const avgCoinPrincipal = await this.getAvgCoinBalance(timeMs);
    const avgFiatPrincipal = await this.getAvgFiatPrincipal(timeMs);
    // Prevent divide-by-zero
    if (avgCoinPrincipal == 0 || avgFiatPrincipal == 0) {
      return 0;
    }

    // How can we limit this to the maxiumum of the maxCushionUpPercent?
    const covered = Math.min(maxPrincipalCovered / avgFiatPrincipal, 1);
    // Multiply this by... how long it's been since we last adjusted?
    const percentOfYear = (timeMs - this.lastDrawDownTime) / yearInMs;
    // We always reserve the maximum percent, ignoring current rates
    // CushionDown ensures that this does not take balance below principal
    const percentCushion = this.getMaxPercentCushion(timeMs - this.lastDrawDownTime)// 1 - (1 / (1 + maxCushionUp * percentOfYear));
    // How many coins we gonna keep now?
    const toReserve = Math.floor(covered * percentCushion * avgCoinPrincipal);
    // Transfer the reserve to this contract
    this.reserved += toReserve;
    this.coinCurrent -= toReserve;
    this.lastDrawDownTime = timeMs;
    this.lastAvgAdjustTime = timeMs;
    return toReserve;
  }
}


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

export const createTesterShim = (fiatPrincipal: number, useJsTester: boolean) =>
  useJsTester
    ? new AbsorberJs(fiatPrincipal)
    : new AbsorberSol(fiatPrincipal);

export const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number) => {
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
