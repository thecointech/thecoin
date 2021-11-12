import { AllActions, loadCurrent } from './load';
import { ConnectContract, TheCoin } from '@thecointech/contract-core';
import { isType, AnyAction, BuyAction, getActionFromInitial, removeIncomplete, storeTransition, TransitionDelta, TypedAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { init } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import { changeInit, toIgnore, toChange, isRefund, tweakBalance } from './changes';
import Decimal from 'decimal.js-light';
import chalk from "chalk";

import blockchain from './blockchain.json';
const bcHistory = blockchain.history.filter(h => !isRefund(h.hash))
import { DateTime } from 'luxon';

// Read cached src data and load into whatever chain is currently running
class Processor {
  data: AllActions = null!;
  brokerAddress: string = "";
  tcCore: TheCoin = null!;
  xaCore: TheCoin = null!;
  allAddresses: string[] = [];

  spaces = 0;

  async init() {
    this.data = loadCurrent()!;
    if (!this.data) return;

    log.level(100); // disable logging

    log.debug(`Cloning stored data onto chain: ${process.env.CONFIG_NAME}`);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
    await init();
    await changeInit();

    const theCoin = await getSigner("TheCoin");
    const brokerCad = await getSigner("BrokerCAD");
    const xferAssit = await getSigner("BrokerTransferAssistant");

    this.brokerAddress = await brokerCad.getAddress();
    this.tcCore = ConnectContract(theCoin);
    this.xaCore = ConnectContract(xferAssit);
    this.allAddresses = new Array(
      ...new Set([
        ...Object.keys(this.data.Buy),
        ...Object.keys(this.data.Sell),
        ...Object.keys(this.data.Bill),
      ])
    );
  }

  async process() {
    for (const address of this.allAddresses) {
      await this.processAddress(address)
    }
    log.debug('All Done');
  }

  async processAddress(address: string) {
    if (toIgnore(address)) return;

    console.group();
    const userActions = [
      ...this.data.Buy[address],
      ...this.data.Sell[address],
      ...this.data.Bill[address],
    ];
    // addTransfers to the mix
    const transfers = getTransfers(address, userActions);
    userActions.push(...transfers as any[]);
    userActions.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());
    console.log(chalk.green(`Converting ${userActions.length} actions for ${address}`));

    let didProcess = false;
    for (const action of userActions) {
      if (isType(action, "Buy"))
        didProcess = await this.cloneBuy(action) || didProcess;
      else if (action.type)
        didProcess = await this.cloneSell(action) || didProcess;
      else if (didProcess) {
        // Do we need to process this one first?
        await this.cloneTransfer(action)
      }
    }

    const newBalance = await this.tcCore.balanceOf(address);
    const bcBalance = blockchain.balances[address as keyof typeof blockchain.balances];
    const oldBalance = tweakBalance(address, bcBalance);

    console.log(chalk.green(`Completed ${newBalance.toString()} of ${oldBalance} for ${address}`))
    if (!newBalance.eq(oldBalance)) debugger;

    console.groupEnd();
  }

  async cloneBuy(original: BuyAction) {
    const clone = await getActionFromInitial(original.address, "Buy", original.data);
    if (clone.history.length > 0) return false;

    const settled = findSettledDate(original);
    const state = await this.doTransfer(original, this.brokerAddress, original.address, 0, settled.toMillis(), this.tcCore);

    for (const delta of original.history) {
      if (delta.type == "depositFiat" && delta.fiat && !delta.date) {
        delta.date = delta.created;
      }
      // push delta

      await storeTransition(clone.doc, delta);
    }
    await markComplete(state, clone);
    return true;
  }

  async cloneSell(original: TypedAction<"Bill" | "Sell">) {
    const clone = await getActionFromInitial(original.address, "Sell", original.data);
    if (clone.history.length > 0) return false;

    const { from, to, fee, timestamp } = original.data.initial.transfer;
    const state = await this.doTransfer(original, from, to, fee, timestamp, this.xaCore);

    for (const delta of original.history) {
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

    console.log(chalk.blue(`${date.toSQLDate()} - Doing Transfer: ${value}`));

    // if from has no money, it hasn't processed yet, so run it instead
    const fromBalance = await this.xaCore.balanceOf(from);
    if (fromBalance.toNumber() == 0) {
      await this.processAddress(from);
      // check that 'from' processed original correctly
      if (bcHistory.indexOf(initial) >= 0)
        throw new Error("Processing did not remove ")
    }
    else {
      const tx = await this.xaCore.runCloneTransfer(
        toChange(from),
        toChange(to),
        value,
        fee,
        date.toMillis(),
      );
      await tx.wait(1);
      // We assume we'll complete successfully
      removeProcessedItem(initial);
    }
  }


  async doTransfer(action: AnyAction, from: string, to: string, fee: number, timestamp: number, contract: TheCoin) {
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
        const balance = await contract.balanceOf(from);

        const oldTx = bcHistory.find(bc => bc.hash == delta.hash);
        if (!oldTx) {
          if (!delta.hash.startsWith("CLOSE ACCOUNT:")) {
            throw new Error;
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


        if (balance.lt(amount.toNumber())) {
          debugger;
        }

        console.log(chalk.blue(`${action.data.date.toString()} - Doing ${action.type}: ${amount.toString()}`));

        const tx = await contract.runCloneTransfer(
          toChange(from),
          toChange(to),
          amount.toNumber(),
          fee,
          timestamp
        );
        await tx.wait(1);
        delta.hash = tx.hash;
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
  const typeFixed = bcHistory.filter(h =>
    (h.transfers[0].from == address || h.transfers[0].to == address) &&
    (!actions.find(a => a.history.find(o => o.hash == h.hash)))
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

const processor = new Processor();
processor.init()
  .then(() => processor.process())
