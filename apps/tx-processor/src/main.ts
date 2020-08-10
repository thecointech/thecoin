import { ProcessUnsettledDeposits } from "@the-coin/tx-processing";
import { init as LogInit, log } from "@the-coin/logging";
import { RbcStore } from "@the-coin/rbcapi/store";
import { ConfigStore } from "@the-coin/store";
import { InitContract } from "@the-coin/tx-processing/deposit/contract";
import { GetWallet } from './wallet';
import { init } from "@the-coin/utilities/firestore";

async function initialize() {
  LogInit("TxProcessing");
  log.debug('Initializing processing');

  RbcStore.initialize();
  ConfigStore.initialize();

  const wallet = await GetWallet();
  if (!wallet) {
    throw new Error("Couldn't load wallet'");
  }

  const contract = await InitContract(wallet);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  init({project: "broker-cad"})

  log.debug('Init Complete');
}

async function Process() {

  initialize();

  const deposits = await ProcessUnsettledDeposits();
}

Process();
