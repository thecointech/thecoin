
import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import '@nomiclabs/hardhat-ethers';
import { ShockAbsorber } from '../src';
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core/*';
import { Duration } from 'luxon';

const FLOAT_FACTOR = 100_000_000_000;
const maxCushionUp = 0.015; //1.5 * FLOAT_FACTOR / 100; // 1.5%
const maxCushionDown = 0.5; //50 * FLOAT_FACTOR / 100; // 50%
const maxPrincipalCovered = 5000;
const maxCushionUpPercent = 1 - (1 / (1 + maxCushionUp)) //FLOAT_FACTOR - (FLOAT_FACTOR * FLOAT_FACTOR / (FLOAT_FACTOR + maxCushionUp));
const useJsTester = true;

export const toCoin = (fiat: number, rate: number) => fiat / (rate / 1e6)
export const toFiat = (coin: number, rate: number) => Math.round(100 * coin * (rate / 1e6)) / 100

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
    const r = await absorber.calcCushionUp(this.fiatPrincipal * 100, Math.floor(coinPrincipal), this.coinCurrent, 0, year);
    return r.toNumber();
  };
  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const r = await absorber.calcCushionDown(this.fiatPrincipal * 100, Math.floor(coinPrincipal), this.coinCurrent);
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
