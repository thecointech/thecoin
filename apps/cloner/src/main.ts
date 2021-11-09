import { loadCurrent } from './load';
import { ConnectContract, TheCoin } from '@thecointech/contract-core';
import { isType, AnyAction, BuyAction, getActionFromInitial, removeIncomplete, storeTransition, TransitionDelta, TypedAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { init } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import { changeInit, toIgnore, toChange } from './changes';

// Read cached src data and load into whatever chain is currently running
async function copyOntoCurrentDeployment() {
  const data = loadCurrent();
  if (!data) return;

  log.debug(`Cloning stored data onto chain: ${process.env.CONFIG_NAME}`);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
  await init();
  await changeInit();

  const theCoin = await getSigner("TheCoin");
  const brokerCad = await getSigner("BrokerCAD");
  const xferAssit = await getSigner("BrokerTransferAssistant");

  const brokerAddress = await brokerCad.getAddress();
  const tcCore = ConnectContract(theCoin);
  const xaCore = ConnectContract(xferAssit);
  const allAddresses = new Array(
    ...new Set([
      ...Object.keys(data.Buy),
      ...Object.keys(data.Sell),
      ...Object.keys(data.Bill),
    ])
  );
  for (const address of allAddresses) {
    if (toIgnore(address)) continue;
    const userActions = [
      ...data.Buy[address],
      ...data.Sell[address],
      ...data.Bill[address],
    ];
    userActions.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());
    log.trace(`Converting ${userActions.length} actions for ${address}`);
    for (const action of userActions) {
      if (isType(action, "Buy"))
        await cloneBuy(action, tcCore, brokerAddress);
      else
        await cloneSell(action, xaCore);
    }
  }
  log.debug('All Done');
}

async function cloneBuy(original: BuyAction, contract: TheCoin, brokerAddress: string) {
  const clone = await getActionFromInitial(original.address, "Buy", original.data);
  if (clone.history.length > 0) return;
  let state: TransitionDelta = {} as any;
  for (const delta of original.history) {
    if (delta.type === "sendCoin") {
      // the "coin" amount is the number that should be transfered
      if (delta.hash && state.coin) {
        if (!state.coin || !state.date) throw new Error("fasdfsa");
        const tx = await contract.cloneTransaction(
          brokerAddress,
          toChange(original.address),
          state.coin.toNumber(),
          0,
          state.date.toMillis(),
        );
        await tx.wait(1);
        delta.hash = tx.hash;
      }
    }

    if (delta.type == "depositFiat" && delta.fiat && !delta.date) {
      delta.date = delta.created;
    }
    // push delta
    await storeTransition(clone.doc, delta);
    state = {
      ...state,
      ...delta,
    }
  }
  await markComplete(state, clone);
}

async function cloneSell(original: TypedAction<"Bill"|"Sell">, contract: TheCoin) {
  const clone = await getActionFromInitial(original.address, "Sell", original.data);
  if (clone.history.length > 0) return;
  let state: TransitionDelta = {} as any;
  for (const delta of original.history) {

    if (delta.type === "depositCoin") {
      // the "coin" amount is the number that should be transfered
      if (delta.hash) {
        const { from, to, value, fee, timestamp } = original.data.initial.transfer;
        const tx = await contract.cloneTransaction(
          from,
          to,
          value,
          fee,
          timestamp
        );
        await tx.wait(1);
        delta.hash = tx.hash;
      }
    }

    if (delta.fiat && (delta.type == "sendETransfer" || delta.type == "payBill")) {
      delta.date = delta.created;
    }
    // push delta
    await storeTransition(clone.doc, delta);
    state = {
      ...state,
      ...delta,
    }
  }
  await markComplete(state, clone);
}

async function markComplete(state: TransitionDelta, action: AnyAction) {
  if (process.env.CONFIG_NAME !== "development") {
    if (state.type == "markComplete") {
      await removeIncomplete(action.type, action.doc)
    }
    else {
      debugger;
    }
  }
}

copyOntoCurrentDeployment();
