import hre from 'hardhat';
import '@nomicfoundation/hardhat-ethers';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { ShockAbsorber } from '../../src';
import { yearInMs, toCoin } from './shockAbsorber.common'
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core';
import { Duration } from 'luxon';

export class AbsorberSol {
  user: string;
  owner: string;
  tcCore: TheCoin;
  tcUser: TheCoin;
  absorber: ShockAbsorber;
  coinCurrent = 0;
  timeMs = 0;

  fiatPrincipal = 0;
  coinAdjustment = 0;
  maxCovered = 0;
  reserved = 0;
  lastDrawDownTime = 0;
  avgFiatPrincipal = 0;
  avgCoinPrincipal = 0;
  lastAvgAdjustTime = 0;
  maxCoverAdjust = 0;
  initMs = 0;

  oracle: {
    contract: SpxCadOracle;
    rate: number;
    validUntil: number;
  }

  static async create(initFiat: number, blockTime?: number) {
    const instance = new AbsorberSol();
    await instance.init(initFiat, blockTime);
    return instance;
  }

  async init(initFiat: number, blockTime?: number) {
    // Reset network prior to any testing
    await hre.network.provider.send("hardhat_reset")

    const { tcCore, absorber, client1, Owner, oracle } = await setupLive(initFiat, blockTime);
    this.user = client1.address;
    this.owner = Owner.address;
    this.absorber = absorber;
    this.tcCore = tcCore;
    this.tcUser = tcCore.connect(client1);

    this.oracle = {
      contract: oracle,
      rate: 100,
      validUntil: (await oracle.validUntil()).toNumber(),
    }
    await this.updateUser();
  }

  async updateUser() {
    const cushion = await this.absorber.getCushion(this.user);
    this.fiatPrincipal = cushion.fiatPrincipal.toNumber() / 100;
    this.coinAdjustment = cushion.coinAdjustment.toNumber();
    this.maxCovered = cushion.maxCovered.toNumber();
    this.reserved = cushion.reserved.toNumber();
    this.lastDrawDownTime = cushion.lastDrawDownTime.toNumber();
    this.avgFiatPrincipal = cushion.avgFiatPrincipal.toNumber() / 100;
    this.avgCoinPrincipal = cushion.avgCoinPrincipal.toNumber();
    this.lastAvgAdjustTime = cushion.lastAvgAdjustTime.toNumber();
    this.maxCoverAdjust = cushion.maxCoverAdjust.toNumber();
    this.initMs = cushion.initTime.toNumber();

    const balance = await this.tcCore.balanceOf(this.user);
    this.coinCurrent = balance.toNumber();
    const lastBlock = await hre.ethers.provider.getBlock("latest");
    this.timeMs = (lastBlock.timestamp * 1000) - this.initMs;
  }

  async setRate(rate: number, timeInMs: number) {
    let nextTime = this.initMs + Math.max(this.timeMs, timeInMs);

    // Check if we actually need to push rates?
    if (this.oracle.rate != rate || this.oracle.validUntil < nextTime) {
      // We have to push new rates, ensure that we advance time appropriately
      // We have to be at least 1 second past the current validity block
      nextTime = Math.max(nextTime, this.oracle.validUntil + 1000);
      const diff = Duration.fromMillis(nextTime - this.oracle.validUntil);
      const toAdvance = Math.ceil(diff.as('days'));
      // Expire current value
      await time.increaseTo(Math.round(nextTime / 1000));
      // Set the new value
      await setOracleValueRepeat(this.oracle.contract, rate, toAdvance);
      // Update cache
      this.oracle.rate = rate;
      this.oracle.validUntil = (await this.oracle.contract.validUntil()).toNumber();
    } else {
      // Have we moved forward in time?
      if (this.timeMs < timeInMs) {
        try {
          // Still move the blockchain forward to simulate time passing
          await time.increaseTo(Math.round(nextTime / 1000));
        } catch (e) {
          // This sometimes fails if the blockchain has advanced past now,
          // but we kinda don't care.
        }
      }
    }
    // Set time to match timeInMs
    if (nextTime - this.initMs != this.timeMs) {
      this.timeMs = nextTime - this.initMs;
    }

    return nextTime;
  }

  cushionUp = async (rate: number, year=0) => {
    const currMs = await this.setRate(rate, year * yearInMs);
    const r = await this.absorber.calcCushionUp(this.user, this.coinCurrent, currMs);
    await this.updateUser();
    return r.toNumber();
  };
  cushionDown = async (rate: number, year=0) => {
    const currMs = await this.setRate(rate, year * yearInMs);
    const r = await this.absorber.calcCushionDown(this.user, this.coinCurrent, currMs);
    await this.updateUser();
    return r.toNumber();
  };

  deposit = async (fiat: number, rate: number, timeMs: number) => {
    await this.setRate(rate, timeMs);
    const coin = toCoin(fiat, rate);
    await this.tcCore.transfer(this.user, coin);
    await this.updateUser();
  };
  withdraw = async (fiat: number, rate: number, timeMs: number) => {
    await this.setRate(rate, timeMs);
    const coin = toCoin(fiat, rate);
    const preBalance = await this.tcCore.balanceOf(this.owner);
    await this.tcUser.transfer(this.owner, coin);
    await this.updateUser();
    const postBalance = await this.tcCore.balanceOf(this.owner);
    return postBalance.sub(preBalance).toNumber();
  }

  getAvgFiatPrincipal = async (timeMs: number) => {
    const r = await this.absorber.getAvgFiatPrincipal(this.user, timeMs + this.initMs);
    return r.toNumber() / 100;
  }

  drawDownCushion = async (timeMs: number) => {
    await this.setRate(100, timeMs);
    await this.absorber.drawDownCushion(this.user, timeMs + this.initMs);
    const oldReserved = this.reserved;
    await this.updateUser();
    return this.reserved - oldReserved;
  }
}


export async function setupAbsorber(tcCoreAddress?: string, oracleAddress?: string) {
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber');
  const absorber = await ShockAbsorber.deploy();
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  await absorber.initialize(tcCoreAddress ?? zeroAddress, oracleAddress ?? zeroAddress);
  return { absorber };
}

export async function createAndInitAbsorber(blockTime?: number) {
  const { Owner, client1, OracleUpdater } = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(Owner);
  const oracle = await createAndInitOracle(OracleUpdater, 100, blockTime);
  const {absorber} = await setupAbsorber(tcCore.address, oracle.address);
  return { absorber, tcCore, oracle, client1, Owner };
}

async function setupLive(initFiat: number, blockTime?: number) {
  const { Owner, client1, oracle, tcCore, absorber } = await createAndInitAbsorber(blockTime);

    // Mint a ridiculously large amount
  await tcCore.mintCoins(10e12, Owner.address, Date.now());

  // Create plugin & assign user
  const initCoin = toCoin(initFiat, 100);
  await tcCore.transfer(client1.address, initCoin);

    const request = await buildAssignPluginRequest(client1, absorber.address, ALL_PERMISSIONS);
  await assignPlugin(tcCore, request);

  // absorber needs funds - start with $100K
  await tcCore.transfer(absorber.address, toCoin(100_000, 100));

  return { absorber, client1, oracle, tcCore, Owner };
}
