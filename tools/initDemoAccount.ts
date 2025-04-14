import { getSigner } from "@thecointech/signers";
import { DateTime, Duration } from "luxon";
import { GetPluginsApi, GetBillPaymentsApi } from '@thecointech/apis/broker';
import { GetContract } from '@thecointech/contract-core';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import Decimal from 'decimal.js-light';
import { CurrencyCode } from "@thecointech/fx-rates";
import { SendFakeDeposit, emailCacheFile } from '@thecointech/email-fake-deposit';
import { writeFileSync } from "fs";
import { loadAndMergeHistory } from '@thecointech/tx-blockchain';
import { AddressLike } from "ethers";

// Always delete any existing emails
//execSync("yarn dev:live", { stdio: "inherit", cwd: "../libs/email-fake-deposit" });
// the above line takes for ages, so do it manually
if (process.env.CONFIG_NAME == "devlive") {
  writeFileSync(emailCacheFile, "[]");
}

/////////////////////////////////////////////
const monthsToRun = 100;
/////////////////////////////////////////////

// Init/Demo account
// Starting from Jan 1 2022
// Send a deposit email to
const tcCore = await GetContract();
const signer = await getSigner("TestDemoAccount");
const testAddress = await signer.getAddress();
if (testAddress != process.env.WALLET_TestDemoAccount_ADDRESS) {
  throw new Error("Invalid demo account address!");
}
const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
const startDate = DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
  hour: 9,
  minute: 35
})

// Get date of last transaction
const initBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);
const tx = await loadAndMergeHistory(initBlock, tcCore, testAddress);
// We start from the last deposit transaction
const deposits = tx.filter(tx => tx.change > 0);
const lastTxDate = deposits[deposits.length - 1]?.date ?? startDate.minus({hour: 2});
console.log(`Last tx: ${lastTxDate.toLocaleString(DateTime.DATETIME_SHORT)}`);

const pausedDate = lastTxDate.plus({ hour: 1});
const endDate = DateTime.min(
  pausedDate.plus({month: monthsToRun}),
  DateTime.now()
);
const visaStep = Duration.fromObject({week: 4});
const visaDuePeriod = Duration.fromObject({week: 3});
const weeklySpending = 350;
const harvestRunsOnDay = [
  1, // Monday
  4, // Thursday
]
const harvestSends = (weeklySpending / harvestRunsOnDay.length);
const billTotal = weeklySpending * visaStep.as("weeks");

const mockPayee = {
  payee: "mocked visa card",
  accountNumber: "1234567890",
}

// First, assign plugins
const plugins = await tcCore.getUsersPlugins(testAddress);
console.log(`Got ${plugins.length} plugins`)
if (plugins.length == 0) {
  const oldNow = DateTime.now

  console.log("Assigning plugins to account...");

  const assignPlugin = async (plugin: AddressLike, minutesBack: number) => {
    const api = GetPluginsApi();
    DateTime.now = () => startDate.minus({minute: minutesBack})
    const request = await buildAssignPluginRequest(
      signer,
      plugin,
      ALL_PERMISSIONS,
    );
    await api.assignPlugin({
      ...request,
      timeMs: request.timeMs.toMillis(),
      signedAt: request.signedAt.toMillis(),
    });
  }
  const converter = await getUberContract();
  const shockAbsorber = await getShockAbsorberContract();

  await assignPlugin(converter, 10);
  await assignPlugin(shockAbsorber, 5);

  DateTime.now = oldNow
  // process.exit(0);
}

const payBillApi = GetBillPaymentsApi();

let currDate = startDate;
let nextPayDate = startDate.plus(visaStep);
DateTime.now = () => currDate

let numSent = 0;
while (currDate < endDate) {

  // It seems our email can get overloaded
  // if (numSent >= 100) {
  //   break;
  // }

  // If we run harvester on this day?
  if (harvestRunsOnDay.includes(currDate.weekday)) {

    if (currDate >= pausedDate) {
      console.log(`Running Harvester for ${currDate.weekdayShort} ${currDate.toLocaleString(DateTime.DATETIME_SHORT)}`);
      numSent++;
       // Send the transfer slightly earlier than the current date
       // This ensures it is processed first in the tx-processor,
       // which is important because deposits need to be present
       // before the bill is processed if the bill is processed
       // immediately (which in the past, it is)
      const r = await SendFakeDeposit(testAddress, harvestSends, currDate.minus({minutes: 1}));
      if (!r) {
        console.log("Failed to send mail");
        break;
      }
    }

    // If it's time to pay our visa bills?
    if (nextPayDate <= currDate) {

      if (currDate >= pausedDate) {

        const dueDate = nextPayDate.plus(visaDuePeriod);
        const billPayment = await BuildUberAction(
          mockPayee,
          signer,
          brokerAddress,
          new Decimal(billTotal),
          CurrencyCode.CAD,
          dueDate
        )
        const signedAt = DateTime.fromMillis(billPayment.transfer.signedMillis).toLocaleString(DateTime.DATETIME_SHORT);
        const dueAt = DateTime.fromMillis(billPayment.transfer.transferMillis).toLocaleString(DateTime.DATETIME_SHORT);
        console.log(`Sending BillPayment: Signed ${signedAt} - Due ${dueAt}`);

        await payBillApi.uberBillPayment(billPayment);
      }

      nextPayDate = nextPayDate.plus(visaStep);
    }
  }

  currDate = currDate.plus({day: 1});
}

console.log("Sent ", numSent, " emails");
