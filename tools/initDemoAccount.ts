import { getSigner } from "@thecointech/signers";
import { DateTime } from "luxon";
import { GetPluginsApi, GetBillPaymentsApi, GetStatusApi } from '@thecointech/apis/broker';
import { ContractCore } from '@thecointech/contract-core';
import { ContractConverter } from '@thecointech/contract-plugin-converter';
import { ContractShockAbsorber } from '@thecointech/contract-plugin-shockabsorber';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import type { TimeSource } from '@thecointech/utilities/TimeSource';
import Decimal from 'decimal.js-light';
import { CurrencyCode } from "@thecointech/fx-rates";
import { SendFakeDeposit, emailCacheFile } from '@thecointech/email-fake-deposit';
import { writeFileSync } from "fs";
import { loadAndMergeHistory } from '@thecointech/tx-blockchain';
import type { AddressLike } from "ethers";
import { getDemoCheckpoint, DemoAccountScheduleStart } from '@thecointech/scraper/testDemoAccountEmulation';

// Always delete any existing emails
if (process.env.CONFIG_NAME == "devlive") {
  writeFileSync(emailCacheFile, "[]");
}

// First, is the server running?
const statusApi = GetStatusApi();
const status = await statusApi.status();
console.log(`Server status: ${status.status}`);

/////////////////////////////////////////////
const monthsToRun = 100;
/////////////////////////////////////////////

// Init/Demo account
// Starting from Jan 2 2023
const tcCore = await ContractCore.get();
const signer = await getSigner("TestDemoAccount");
const testAddress = await signer.getAddress();
if (testAddress != process.env.WALLET_TestDemoAccount_ADDRESS) {
  throw new Error("Invalid demo account address!");
}
const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;

// Get date of last transaction
const initBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);
const tx = await loadAndMergeHistory(initBlock, tcCore, testAddress);
// We start from the last deposit transaction
const deposits = tx.filter(tx => tx.change > 0);
const lastTxDate = deposits.at(-1)?.date ?? DemoAccountScheduleStart.minus({ day: 1 });
console.log(`Last tx: ${lastTxDate.toLocaleString(DateTime.DATETIME_SHORT)}`);

const endDate = DateTime.min(
  lastTxDate.plus({month: monthsToRun}),
  DateTime.now()
);

const mockPayee = {
  payee: "mocked visa card",
  accountNumber: "1234567890",
}

const atDemoRunTime = (date: DateTime) => date.set({
  hour: 9,
  minute: 35,
  second: 0,
  millisecond: 0,
});

const timeSourceAt = (date: DateTime): TimeSource =>
  () => date.toMillis();

// First, assign plugins
const plugins = await tcCore.getUsersPlugins(testAddress);
console.log(`Got ${plugins.length} plugins`)
if (plugins.length == 0) {

  console.log("Assigning plugins to account...");

  const assignPlugin = async (plugin: AddressLike, minutesBack: number) => {
    const api = GetPluginsApi();
    const signedAt = atDemoRunTime(DemoAccountScheduleStart)
      .minus({ minutes: minutesBack });

    const request = await buildAssignPluginRequest(
      signer,
      plugin,
      ALL_PERMISSIONS,
      timeSourceAt(signedAt),
    );
    await api.assignPlugin({
      ...request,
      timeMs: request.timeMs.toMillis(),
      signedAt: request.signedAt.toMillis(),
    });
  }
  const converter = await ContractConverter.get();
  const shockAbsorber = await ContractShockAbsorber.get();

  await assignPlugin(converter, 10);
  await assignPlugin(shockAbsorber, 5);
}

const payBillApi = GetBillPaymentsApi();

let currDate = lastTxDate;
let priorCheckpoint = getDemoCheckpoint(currDate);

let numSent = 0;
try {
  while (currDate < endDate) {

    // It seems our email can get overloaded
    // if (numSent >= 100) {
    //   break;
    // }

    const checkpoint = getDemoCheckpoint(currDate);
    const settledPayment = priorCheckpoint.pendingPayment && !checkpoint.pendingPayment
      ? priorCheckpoint.pendingPayment.amount
      : 0;
    const toDeposit = checkpoint.visa.balance
      .subtract(priorCheckpoint.visa.balance)
      .add(settledPayment);

    if (toDeposit.value > 0) {
      // Send the transfer slightly earlier than the current date
      // This ensures it is processed first in the tx-processor,
      // which is important because deposits need to be present
      // before the bill is processed if the bill is processed
      // immediately (which in the past, it is)
      const depositDate = atDemoRunTime(currDate).minus({minute: 1});
      const r = await SendFakeDeposit(testAddress, toDeposit.value, depositDate);
      if (!r) {
        console.error("Failed to send mail");
        break;
      }
      console.log(`Sent deposit for ${toDeposit} for ${currDate.weekdayShort} ${currDate.toLocaleString(DateTime.DATETIME_SHORT)}`);
      numSent++;
    }

    const priorPaymentDate = priorCheckpoint.pendingPayment?.date ?? priorCheckpoint.visa.dueDate;
    if (checkpoint.pendingPayment && checkpoint.pendingPayment.date > priorPaymentDate) {
      const billPayment = await BuildUberAction(
        mockPayee,
        signer,
        brokerAddress,
        new Decimal(checkpoint.pendingPayment.amount.value),
        CurrencyCode.CAD,
        checkpoint.pendingPayment.date,
        timeSourceAt(atDemoRunTime(currDate)),
      )
      await payBillApi.uberBillPayment(billPayment);

      const signedAt = DateTime.fromMillis(billPayment.transfer.signedMillis).toLocaleString(DateTime.DATETIME_SHORT);
      const dueAt = DateTime.fromMillis(billPayment.transfer.transferMillis).toLocaleString(DateTime.DATETIME_SHORT);
      console.log(`Sent BillPayment: Signed ${signedAt} - Due ${dueAt}`);
    }

    priorCheckpoint = checkpoint;
    currDate = currDate.plus({day: 1});
  }
}
catch (e) {
  console.error(e);
  throw e;
}
finally {
  console.log("Sent ", numSent, " emails");
}
