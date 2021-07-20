import { log } from "@thecointech/logging";
import { init as FirestoreInit } from '@thecointech/firestore';
import { RbcStore, initBrowser } from "@thecointech/rbcapi";
import { initialize as initGmail } from '@thecointech/tx-gmail';
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract';
import { getCode } from './auth';

export async function initialize() {
  log.debug(' --- Initializing processing --- ');

  // We have to load (and cache) signers before setting
  // the GOOGLE_APPLICATION_CREDENTIALS env variable below
  // to ensure prodtest loads from the right location
  const signer = await getSigner('BrokerCAD');
  await getSigner('BrokerTransferAssistant');
  const address = await signer.getAddress();
  const contract = await ConnectContract(signer);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }
  log.debug(`Initialized contract to address: ${address}`);

  // Set to broker service account for Firestore Access
  // Must be done after connecting the signer abov
  if (process.env.BROKER_SERVICE_ACCOUNT)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;

  await FirestoreInit();
  RbcStore.initialize();
  ConfigStore.initialize();

  await initGmail(getCode);

  await initBrowser({
    headless: false
  })

  log.debug('Init Complete');
  return contract;
}
