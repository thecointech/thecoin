import { AllActions, loadCurrent, loadMinting } from './load';
import type { TheCoin } from '../../src';
import { isType, AnyAction, BuyAction, getActionFromInitial, removeIncomplete, storeTransition, TransitionDelta, TypedAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { init } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import { connect } from '@thecointech/contract-base/connect';
import { changeInit, toIgnore, toChange, isRefund, tweakBalance } from './changes';
import Decimal from 'decimal.js-light';
import chalk from "chalk";
import { NormalizeAddress } from "@thecointech/utilities";
import { nextOpenTimestamp } from '@thecointech/market-status';

import blockchain from './blockchain.json';
const bcHistory = blockchain.history.filter(h => !isRefund(h.hash))
import { DateTime } from 'luxon';
import { toCoin } from './pricing';
import { fetchRate } from '@thecointech/fx-rates';
import { loadAndMergeHistory, Transaction } from '@thecointech/tx-blockchain';
import { THECOIN_ROLE } from '../../src/constants';
import { deployProvider } from '@thecointech/ethers-provider';

const nullAddress = "0x0000000000000000000000000000000000000000";
const thirtyGwei = 30 * Math.pow(10, 9);

// Read cached src data and load into whatever chain is currently running
export class Processor {
  data: AllActions = null!;
  xaAddress: string = "";
  brokerAddress: string = "";
  theCoinAddress: string = "";
  tcCore: TheCoin = null!;
  xaCore: TheCoin = null!;
  mtCore: TheCoin = null!;
  bcCore: TheCoin = null!;
  allAddresses: string[] = [];

  spaces = 0;
  history: Transaction[] = [];


  async init(contract: TheCoin) {
    this.data = loadCurrent()!;
    if (!this.data) return false;

    log.debug(`Cloning stored data onto chain: ${process.env.CONFIG_NAME}`);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
    await init();
    await changeInit();

    const theCoin = await getSigner("TheCoin");
    const brokerCad = await getSigner("BrokerCAD");
    const xferAssit = await getSigner("BrokerTransferAssistant");
    const minter = await getSigner("Minter");

    const infura = deployProvider("POLYGON");
    this.xaAddress = NormalizeAddress(await xferAssit.getAddress());
    this.brokerAddress = NormalizeAddress(await brokerCad.getAddress());
    this.theCoinAddress = NormalizeAddress(await theCoin.getAddress());
    this.tcCore = connect(theCoin, contract);
    this.xaCore = connect(xferAssit, contract.connect(infura));
    this.mtCore = connect(minter, contract.connect(infura));
    this.bcCore = connect(brokerCad, contract.connect(infura));
    this.allAddresses = new Array(
      ...new Set([
        ...Object.keys(this.data.Buy),
        ...Object.keys(this.data.Sell),
        ...Object.keys(this.data.Bill),
      ])
    );

    const history: Transaction[] = await loadAndMergeHistory(null as any, 22291140, contract);
    this.history = history.map(h => ({
      ...h,
      from: NormalizeAddress(h.from),
      to: NormalizeAddress(h.to),
      counterPartyAddress: NormalizeAddress(h.counterPartyAddress),
    }));
    return true;
  }

  async process() {

    // We use xa to do all clone transfers, so temporarily grant super-privilges
    if (!await this.tcCore.hasRole(THECOIN_ROLE, this.xaAddress)) {
      const granting = await this.tcCore.grantRole(THECOIN_ROLE, this.xaAddress);
      log.trace(`Granting super-privilges: ${granting.hash}`);
      granting.wait(1);
    }

    await this.processMinting();

    for (let i = 0; i <  this.allAddresses.length; i++) {
      const address = this.allAddresses[i];
      log.info(`[${i}:${this.allAddresses.length}] ${address}`);
      await this.processAddress(address)
    }
    const revoking = await this.tcCore.revokeRole(THECOIN_ROLE, this.xaAddress);
    log.trace(`Revoking super-privilges: ${revoking.hash}`);
    revoking.wait(1);
    log.debug('All Done');
  }

  legalDuplicates = [
    "0x7A8B466C4ABE76ED32F8D934607B0DEDD24D2EA6",
    "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4",
  ]
  duplicator: Record<string, number> = {};
  hasAlreadyHappened(from: string, to: string, value: number, date: DateTime) {
    from = NormalizeAddress(from);
    to = NormalizeAddress(to);
    const allSimilar = this.history.filter(e =>
      e.date.equals(date) &&
      e.value.eq(value) &&
      e.from == from &&
      e.to == to);
    if (allSimilar.length > 1) {
      if (!this.legalDuplicates.includes(from) && !this.legalDuplicates.includes(to)) {
        debugger;
        throw new Error("Bad Ass Here");
      }
      const key = `${from}${to}${value}${date.toMillis()}`;
      const cnt = this.duplicator[key] ?? 0;

      let d = allSimilar[cnt];
      this.duplicator[key] = cnt + 1;
      return d;
    }
    return allSimilar[0];
  }

  async getGasPrice() {
    const srcGasPrice = await this.xaCore.provider.getGasPrice();
    return { gasPrice: Math.max(thirtyGwei, srcGasPrice.toNumber()) };
  }

  async runCloneTransfer(from: string, to: string, value: number, fee: number, timestamp: DateTime) {
    const hasHappened = this.hasAlreadyHappened(from, to, value, timestamp);
    if (hasHappened?.txHash)
      return hasHappened.txHash;

    const gasPrice = await this.getGasPrice();
    const waiter = await this.xaCore.runCloneTransfer(from, to, value, fee, timestamp.toMillis(), gasPrice);
    log.info(`runCloneTransfer: ${waiter.hash}`);
    await waiter.wait(1);
    log.trace('done');
    return waiter.hash;
  }

  async mintCoins(value: Decimal, to: string, date: DateTime) {
    const hasHappened = this.hasAlreadyHappened(nullAddress, to, value.toNumber(), date);
    if (hasHappened?.txHash)
      return hasHappened.txHash;

    const gasPrice = await this.getGasPrice();
    const waiter = await this.mtCore.mintCoins(value.toNumber(), to, date.toMillis(), gasPrice);
    log.info(`mintCoins: ${waiter.hash}`);
    await waiter.wait(1);
    log.trace('done');
    return waiter.hash;
  }

  async burnCoins(value: Decimal, date: DateTime) {
    const hasHappened = this.hasAlreadyHappened(this.theCoinAddress, nullAddress, value.toNumber(), date);
    if (hasHappened?.txHash)
      return hasHappened.txHash;

    const gasPrice = await this.getGasPrice();
    const waiter = await this.tcCore.burnCoins(value.toNumber(), date.toMillis(), gasPrice);
    log.info(`burnCoins: ${waiter.hash}`);
    await waiter.wait(1);
    log.trace('done');
    return waiter.hash;
  }

  async processMinting() {
    const minting = loadMinting();

    if (!minting) return; // TODO: default?
    log.info(`Minting ${minting.length} items`)
    for (const { originator, date, fiat, currency } of minting) {
      log.trace(`Minting ${fiat.toString()} at ${date.toSQLDate()}`);

      const to = toChange(originator);
      // First; convert from fiat to token
      const nextOpen = await nextOpenTimestamp(date);
      const rate = await fetchRate(new Date(nextOpen));
      if (!rate) throw new Error("Kerplewey");
      const coin = await toCoin(rate, fiat, currency);

      // We adjust our date to be aligned with the rate fetched.
      // This is to be compatible with dates calculated in 2018
      if (rate.validFrom > nextOpen || rate.validTill < nextOpen) {
        log.error("WRRRRTTTTFFFFFF?????");
        debugger;
        throw new Error("give up and go home");
      }
      const mintDate = DateTime.fromMillis(nextOpen);
      // let mintDate = date;
      // if (date.toMillis() < rate.validFrom) {
      //   mintDate = DateTime.fromMillis(rate.validFrom)
      //   log.warn(`Adjusting mint date from ${date.toString()} to ${mintDate.toString()}`);
      // }

      if (coin.gt(0)) {
        await this.mintCoins(coin, this.theCoinAddress, mintDate);
        // If not intended for Core, forward this onto final recipient
        await this.runCloneTransfer(this.theCoinAddress, to, coin.toNumber(), 0, mintDate);

      } else {
        const abs = coin.abs();
        // Transfer back to broker for burning
        await this.runCloneTransfer(to, this.theCoinAddress, abs.toNumber(), 0, mintDate);
        // Burn coins
        await this.burnCoins(abs, mintDate);
      }
    }
    log.info(`Minting done`)
  }

  async processAddress(address: string) {
    if (toIgnore(address)) return;

    const userActions = [
      ...this.data.Buy[address],
      ...this.data.Sell[address],
      ...this.data.Bill[address],
    ];
    // addTransfers to the mix
    const transfers = getTransfers(address, userActions);
    userActions.push(...transfers as any[]);
    userActions.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());
    log.trace(`Converting ${userActions.length} actions for ${address}`);

    let didProcess = false;
    for (const action of userActions) {
      if (isType(action, "Buy"))
        didProcess = await this.cloneBuy(action) || didProcess;
      else if (action.type)
        didProcess = await this.cloneSell(action) || didProcess;
      else if (didProcess) {
        await this.cloneTransfer(action)
      }
    }

    const newBalance = await this.tcCore.balanceOf(address);
    const bcBalance = blockchain.balances[address as keyof typeof blockchain.balances];
    const oldBalance = tweakBalance(address, bcBalance);

    log.info(`Completed ${newBalance.toString()} of ${oldBalance} for ${address}`);
    if (process.env.CONFIG_NAME !== "development") {
      if (!newBalance.eq(oldBalance)) debugger;
    }
  }

  async deleteHistory(action: AnyAction) {
    const history = await action.doc.collection("History").listDocuments?.();
    if (history) {
      for (const transition of history) {
        await transition.delete();
      }
    }
  }

  async cloneBuy(original: BuyAction) {
    // Our updater has mixed up some timestamps, and we
    // ended up with some duplicates in our prod db
    if (original.data.initialId == "other:1064:1585947651462") return false;

    const clone = await getActionFromInitial(original.address, "Buy", original.data);
    await this.deleteHistory(clone);

    // Some transfers
    const from = (original.data.initial.type == "other" && original.address != "0x8B40D01D2BCFFEF5CF3441A8197CD33E9ED6E836")
      ? "0xe6d09f09432c3ec43f645c2d5b10f0ff5c834749"
      : this.brokerAddress;

    const settled = findSettledDate(original);
    const state = await this.doTransfer(original, from, original.address, 0, settled);

    for (let i = 0; i < original.history.length; i++) {
      const delta = original.history[i];
      if (delta.type == "depositFiat" && delta.fiat && !delta.date) {
        delta.date = delta.created;
      }

      await storeTransition(clone.doc, delta);
    }
    await markComplete(state, clone);
    return true;
  }

  async cloneSell(original: TypedAction<"Bill" | "Sell">) {
    const clone = await getActionFromInitial(original.address, "Sell", original.data);
    await this.deleteHistory(clone);

    const { from, to, fee, timestamp } = original.data.initial.transfer;
    const state = await this.doTransfer(original, from, to, fee, DateTime.fromMillis(timestamp));

    for (let i = 0; i < original.history.length; i++) {
      const delta = original.history[i];
      if (delta.fiat && (delta.type == "sendETransfer" || delta.type == "payBill")) {
        delta.date = delta.created;
      }
      // push delta
      await storeTransition(clone.doc, delta);
    }
    await markComplete(state, clone);
    return true;
  }

  async cloneTransfer(original: ReturnType<typeof getTransfers>[0]) {
    const { date, initial } = original.data;
    const [first, second] = initial.transfers;
    const fee = second
      ? second.value
      : 0;
    const { from, to, value } = first;
    const redirFrom = toChange(from);

    // Has this already happened?
    log.trace(`${date.toSQLDate()} - Doing Transfer: ${value}`);

    // Because we process both 2 and from, this can loop
    const hasHappened = this.hasAlreadyHappened(redirFrom, to, value, date);
    if (hasHappened?.txHash)
      return;

    // if from has no money, it hasn't processed yet, so run it instead
    const fromBalance = await this.xaCore.balanceOf(redirFrom);
    if (fromBalance.toNumber() == 0) {
      await this.processAddress(redirFrom);
      // check that 'from' processed original correctly
      if (bcHistory.indexOf(initial) >= 0) {
        debugger;
        throw new Error("Processing did not remove ")
      }
    }
    else {
      await this.runCloneTransfer(
        redirFrom,
        toChange(to),
        value,
        fee,
        date,
      );
      // We assume we'll complete successfully
      removeProcessedItem(initial);
    }
  }

  async doTransfer(action: AnyAction, from: string, to: string, fee: number, date: DateTime) {
    const transfers = action.history.filter(tx => tx.hash);
    if (transfers.length > 1) {
      debugger;
    }
    let state: TransitionDelta = {

    } as any;
    for (const delta of action.history) {
      // the "coin" amount is the number that should be transfered
      if (delta.hash) {

        let amount = state.coin ?? delta.coin!;
        const balance = await this.tcCore.balanceOf(from);

        const oldTx = bcHistory.find(bc => bc.hash == delta.hash);
        if (!oldTx) {
          if (!delta.hash.startsWith("CLOSE ACCOUNT:")) {
            debugger;
            throw new Error(`Cannot find tx for ${action.type}: ${delta.hash}`);
          } else {
            amount = new Decimal(balance.toNumber());
            delta.coin = amount;
            to = this.brokerAddress;
          }
        }
        else {
          if (!oldTx.transfers.length) debugger;

          const oldAmount = oldTx.transfers[0].value;
          if (!amount.eq(oldAmount)) {
            if (!replaceCoin(action, amount, oldAmount)) {
              throw new Error("Cannot do something");
            }
            amount = new Decimal(oldAmount);
          }
          if ((oldTx.transfers[1]?.value ?? 0) != fee) {
            fee = oldTx.transfers[1]?.value
            debugger;
          }
        }


        // if (balance.lt(amount.toNumber())) {
        //   log.warn(`Address ${from} with balance ${balance.toNumber()} is xfer: ${amount.toNumber()}`)
        //   debugger;
        // }

        log.trace(`${action.data.date.toString()} - Doing ${action.type}: ${amount.toString()}`);

        delta.hash = await this.runCloneTransfer(
          toChange(from),
          toChange(to),
          amount.toNumber(),
          fee,
          date
        );
        removeProcessedItem(oldTx);
      }
      state = {
        ...state,
        ...delta,
      }
    }
    return state;
  }
}

function getTransfers(address: string, actions: AnyAction[]) {
  // Find all transfers not already accounted for
  const src = bcHistory.filter(h =>
    (h.transfers[0].from == address || h.transfers[0].to == address) &&
    (!actions.find(a => a.history.find(o => o.hash == h.hash))) &&
    !toIgnore(h.transfers[0].to)
  );
  if (src.find(h => toIgnore(h.transfers[0].to)))
    debugger;
  const typeFixed = bcHistory.filter(h =>
    (h.transfers[0].from == address || h.transfers[0].to == address) &&
    !actions.find(a => a.history.find(o => o.hash == h.hash)) &&
    !toIgnore(h.transfers[0].to)
  ).map(tx => {
    return {
      data: {
        date: DateTime.fromSeconds(tx.timestamp ?? 0),
        initial: tx,
        initialId: tx.hash,
      },
      history: [] as TransitionDelta[]
    };
  })
  return typeFixed;
}

function findSettledDate(container: AnyAction) {
  const settlements = container.history.filter(t => t.type == "toCoin");
  return settlements[settlements.length - 1]?.date ?? container.data.date;
}

function removeProcessedItem(item?: typeof bcHistory[0]) {
  if (item) {
    const idx = bcHistory.indexOf(item);
    if (!idx) throw new Error("Cannot remove item here");
    bcHistory.splice(idx, 1);
  }
}

function replaceCoin(action: AnyAction, old: Decimal, replace: number) {
  for (const delta of action.history) {
    if (delta.coin?.eq(old)) {
      delta.coin = new Decimal(replace);
      return true;
    }
  }
  return false;
}

async function markComplete(state: TransitionDelta, action: AnyAction) {
  if (process.env.CONFIG_NAME !== "development") {
    if (state.type == "markComplete") {
      await removeIncomplete(action.type, action.doc)
    }
    else if (action.address != '0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4') {
      debugger;
    }
  }
}
