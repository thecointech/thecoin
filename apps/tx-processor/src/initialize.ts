import { log } from "@thecointech/logging";
import { getFirestore, init as FirestoreInit } from '@thecointech/firestore';
import { RbcStore, closeBrowser } from "@thecointech/rbcapi";
import gmail from '@thecointech/tx-gmail';
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/signers';
import { ConnectContract, TheCoin } from '@thecointech/contract-core';
import { formatEther, parseUnits } from "@ethersproject/units";
import { SendMail } from "@thecointech/email";
import { weSellAt, fetchRate } from '@thecointech/fx-rates';
import type { Signer } from "@ethersproject/abstract-signer";
import { toHuman } from "@thecointech/utilities";
import { sleep } from '@thecointech/async';

export async function initialize() {
  log.debug(' --- Initializing processing --- ');

  // We have to load (and cache) signers before setting
  // the GOOGLE_APPLICATION_CREDENTIALS env variable below
  // to ensure prodtest loads from the right location
  const signer = await getSigner('BrokerCAD');
  await getSigner('BrokerTransferAssistant');

  const contract = await ConnectContract(signer);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  await verifyEtherReserves(contract.signer);
  await verifyCoinReserves(signer, contract);
  log.debug(`Initialized contract to address: ${contract.address}`);

  // Set to broker service account for Firestore Access
  // Must be done after connecting the signer abov
  if (process.env.BROKER_SERVICE_ACCOUNT)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;

  await FirestoreInit();
  RbcStore.initialize();
  ConfigStore.initialize();

  let token = await ConfigStore.get("gmail.token");
  token = await gmail.initialize(token);
  await ConfigStore.set("gmail.token", token);

  log.debug('Init complete');
  return contract;
}

// Verify we have enough gas to run processing
async function verifyEtherReserves(signer: Signer) {
  const signerBalance = await signer.getBalance();
  const minimumBalance = parseUnits('0.2', "ether");
  log.debug({ Balance: formatEther(signerBalance) }, "Processing with eth reserves: ${Balance}")
  if (signerBalance.lt(minimumBalance)) {
    log.error(
      { Balance: formatEther(signerBalance), MinimumBalance: formatEther(minimumBalance), Signer: 'BrokerCAD' },
      `Signer {Signer} ether balance too low {Balance} < {MinimumBalance}`
    );
    await SendMail(`WARNING: Signer balance too low ${signerBalance.toString()}`, `Signer balance too low ${signerBalance.toString()}\nMinimum balance required: ${minimumBalance.toString()}`);
    // If anyone is watching, give them time to react
    await sleep(10_000);
  }
}

// Verify we have enough reserves to run processing
async function verifyCoinReserves(signer: Signer, contract: TheCoin) {
  const signerAddress = await signer.getAddress();
  const reservesCoin = await contract.balanceOf(signerAddress);
  const now = new Date();
  const rate = await fetchRate(now);
  if (!rate) {
    log.error("tx-processor couldn't fetch current rate");
    return;
  }
  const reservesCad = toHuman(
    reservesCoin.toNumber() * weSellAt([rate], now),
    true
  );
  log.debug({ Balance: reservesCad }, "Processing with $ reserves: ${Balance}")
  const minimumBalance = 10_000;
  if (reservesCad < minimumBalance) {
    log.error(
      { Balance: reservesCad, MinimumBalance: minimumBalance, Signer: 'BrokerCAD' },
      `Signer {Signer} $ balance too low {Balance} < {MinimumBalance}`
    );
    log.error(`Not enough coin reserves: ${formatEther(reservesCad)} CAD`);
    // If anyone is watching, give them time to react
    await sleep(10_000);
  }
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
