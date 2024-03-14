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
import { SendFakeDeposit } from '@thecointech/email-fake-deposit';

// Init/Demo account
// Starting from Jan 1 2022
// Send a deposit email to
const signer = await getSigner("testDemoAccount");
const address = await signer.getAddress();
const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
const startDate = DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
  hour: 9,
  minute: 35
})
const pausedDate = startDate; //.plus({month: 6});
const endDate = DateTime.now(); //startDate.plus({month: 6});
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
const tcCore = await GetContract();
const plugins = await tcCore.getUsersPlugins(address);

if (plugins.length == 0) {
  const oldNow = DateTime.now

  console.log("Assigning plugins to account...");

  const assignPlugin = async (pluginAddress: string, minutesBack: number) => {
    const api = GetPluginsApi();
    DateTime.now = () => startDate.minus({minute: minutesBack})
    const request = await buildAssignPluginRequest(
      signer,
      pluginAddress,
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

  await assignPlugin(converter.address, 10);
  await assignPlugin(shockAbsorber.address, 5);

  DateTime.now = oldNow
  process.exit(0);
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
      const r = await SendFakeDeposit(address, harvestSends, currDate);
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
