import { log } from "@thecointech/logging";
import { getFirestore, init as FirestoreInit } from '@thecointech/firestore';
import { RbcStore, closeBrowser } from "@thecointech/rbcapi";
import gmail from '@thecointech/tx-gmail';
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/signers';
import { ConnectContract, TheCoin } from '@thecointech/contract-core';
import { SendMail } from "@thecointech/email";
import { weSellAt, fetchRate } from '@thecointech/fx-rates';
import { toHuman } from "@thecointech/utilities";
import { sleep } from '@thecointech/async';
import { Signer, formatEther } from "ethers";

export async function initialize() {
  log.debug(' --- Initializing processing --- ');

  // Set to broker service account for Firestore Access
  await FirestoreInit({ service: 'BrokerServiceAccount' });
  RbcStore.initialize();
  ConfigStore.initialize();

  let token = await ConfigStore.get("gmail.token");
  token = await gmail.initialize(token);
  await ConfigStore.set("gmail.token", token);

  const signer = await getSigner('BrokerCAD');
  await getSigner('BrokerTransferAssistant');

  const contract = await ConnectContract(signer);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  await verifyEtherReserves(signer);
  await verifyCoinReserves(signer, contract);
  log.debug(`Initialized contract to address: ${await contract.getAddress()}`);

  log.debug('Init complete');
  return contract;
}

// Verify we have enough gas to run processing
async function verifyEtherReserves(signer: Signer) {
  const signerBalance = await signer.provider?.getBalance(signer) ?? 0n;
  const signerAddress = await signer.getAddress();
  const balanceEth = formatEther(signerBalance);
  verifyMinBalance(Number(balanceEth), 0.2, "BrokerCAD", signerAddress, "ether");
}

// Verify we have enough reserves to run processing
async function verifyCoinReserves(signer: Signer, contract: TheCoin) {
  const signerAddress = await signer.getAddress();
  const balanceCoin = await contract.balanceOf(signerAddress);
  const now = new Date();
  const rate = await fetchRate(now);
  if (!rate?.sell || !rate?.fxRate) {
    log.fatal("tx-processor couldn't fetch current rate");
    return;
  }
  const balanceCad = toHuman(
    Number(balanceCoin) * weSellAt([rate], now),
    true
  );
  verifyMinBalance(balanceCad, 10_000, "BrokerCAD", signerAddress, "$CAD");
}

async function verifyMinBalance(Balance: number, MinimumBalance: number, Signer: string, Address: string, currency: string) {
  log.debug({ Balance }, `Processing with ${currency} reserves: {Balance}`)
  if (Balance < MinimumBalance) {
    log.error(
      { Balance, MinimumBalance, Signer, Address },
      `Signer {Signer} ${currency} balance too low {Balance} < {MinimumBalance}`
    );
    await SendMail(`WARNING: Signer balance too low ${Balance}`, `${Signer} balance too low ${currency} ${Balance}\nMinimum balance required: ${MinimumBalance}`);
    log.error(`Not enough ${currency} reserves: ${Balance}`);
    await maybeSleep();
  }
}
async function maybeSleep() {
  if (process.env.NODE_ENV !== "development") {
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
