import { log } from "@thecointech/logging";
import { getFirestore, init as FirestoreInit } from '@thecointech/firestore';
import { RbcStore, closeBrowser } from "@thecointech/rbcapi";
import gmail from '@thecointech/tx-gmail';
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';

export async function initialize() {
  log.debug(' --- Initializing processing --- ');

  // We have to load (and cache) signers before setting
  // the GOOGLE_APPLICATION_CREDENTIALS env variable below
  // to ensure prodtest loads from the right location
  const signer = await getSigner('BrokerCAD');
  const contract = await ConnectContract(signer);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }
  log.debug(`Initialized contract to address: ${contract.address}`);

  // Set to broker service account for Firestore Access
  // Must be done after connecting the signer abov
  if (process.env.BROKER_SERVICE_ACCOUNT)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;

  await FirestoreInit();
  RbcStore.initialize();
  ConfigStore.initialize();

  let token = await ConfigStore.get("gmail.token")
  token = await gmail.initialize(token);
  await ConfigStore.set("gmail.token", token)

  log.debug('Init complete');
  return contract;
}

export async function release() {
  log.trace('Closing browser');
  await closeBrowser();

  log.trace('Closing dbs');
  await RbcStore.release();
  await ConfigStore.release();

  log.trace('Closing firestore');
  await getFirestore().terminate();

  log.debug(' --- Release complete --- ');
}
