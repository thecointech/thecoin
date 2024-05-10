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

// TODO: Use the account itself to set an initial date
const pausedAfterMonths = 0;
const monthsToRun = 50;

// Init/Demo account
// Starting from Jan 1 2022
// Send a deposit email to
const tcCore = await GetContract();
const signer = await getSigner("testDemoAccount");
const testAddress = await signer.getAddress();
const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
const startDate = DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
  hour: 9,
  minute: 35
})

// Get date of last transaction
const tx = await loadAndMergeHistory(0, tcCore, testAddress);
const lastTxDate = tx[tx.length - 1]?.date ?? startDate;
console.log(`Last tx: ${lastTxDate.toLocaleString(DateTime.DATETIME_SHORT)}`);

const pausedDate = lastTxDate.plus({ hour: 1}); // startDate.plus({month: pausedAfterMonths});
const endDate = DateTime.min(
  startDate.plus({month: pausedAfterMonths + monthsToRun}),
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

  // If we run harvester on this day?
  if (harvestRunsOnDay.includes(currDate.weekday)) {

    if (currDate >= pausedDate) {
      console.log(`Running Harvester for ${currDate.weekdayShort} ${currDate.toLocaleString(DateTime.DATETIME_SHORT)}`);
      numSent++;
       // We always do our transfer
      const r = await SendFakeDeposit(testAddress, harvestSends, currDate);
      if (!r) {
        console.log("Failed to send mail");
        break;
      }
    }

    // If it's time to pay our visa bills?
    if (nextPayDate <= currDate) {

      if (currDate >= pausedDate) {

        console.log(`Sending BillPayment `);

        const dueDate = nextPayDate.plus(visaDuePeriod);
        const billPayment = await BuildUberAction(
          mockPayee,
          signer,
          brokerAddress,
          new Decimal(billTotal),
          CurrencyCode.CAD,
          dueDate
        )
        await payBillApi.uberBillPayment(billPayment);
      }

      nextPayDate = nextPayDate.plus(visaStep);
    }
  }

  currDate = currDate.plus({day: 1});
}

console.log("Sent ", numSent, " emails");
