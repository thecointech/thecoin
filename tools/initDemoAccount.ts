import { getSigner } from "@thecointech/signers";
import { randomBytes } from "crypto";
import { DateTime, Duration } from "luxon";

import { SendMail } from '@thecointech/email';
import { GetPluginsApi, GetBillPaymentsApi } from '@thecointech/apis/broker';
import { GetContract } from '@thecointech/contract-core';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import Decimal from 'decimal.js-light';
import { CurrencyCode } from "@thecointech/fx-rates";


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
const endDate = startDate.plus({month: 1});
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

export const getEmailTitle = () => "INTERAC e-Transfer: (fake deposit) has sent you money."
export const getEmailAddress = (coinAddress: string) => `${coinAddress}@test.thecoin.io`
export const getEmailBody = (amount: number, when: DateTime) => {
  const randomId = randomBytes(4).toString('hex');
  const p1 = randomBytes(32).toString('hex');
  const expiry = DateTime.now().plus({month: 1})

  return `
Hi Coin,

Fake Deposit sent you a money transfer for the amount of $${amount.toFixed(2)} (CAD) .


Message:


Expiry Date: ${expiry.toLocaleString(DateTime.DATE_FULL)}

To deposit your money, click here:
https://etransfer.interac.ca/${randomId}/${p1}

Pour voir les d=C3=A9tails du Virement INTERAC(MD) en fran=C3=A7ais, cliquez sur le lien ci-dessous:
https://etransfer.interac.ca/fr/${randomId}/${p1}

What if you could deposit transfers without answering any questions? Sign up for Autodeposit in your online banking <here> =E2=80=93 the safe and convenient way to receive funds straight to your bank account.

This email was sent to you by Interac Corp., the owner of the INTERAC e-Transfer=C2=AE service, on behalf of Fake Deposit.
Interac Corp.
P.O. Box 45, Toronto, Ontario M5J 2J1
www.interac.ca

{ dateOverride: "${when.toISO()}" }

=C2=AE Trade-mark of Interac Corp.  Used under license.`
}

// First, assign plugins
const tcCore = await GetContract();

const uberConverter = await getUberContract();
const asCoin = await uberConverter["toCoin(uint256,uint256)"](140000, 1676907300000);
console.log(`Coin: ${asCoin.toString()}`);

const balance = await tcCore.balanceOf(address);
console.log(`Balance: ${balance.toString()}`);
const plBalacne = await tcCore.pl_balanceOf(address);
console.log(`PlBalance: ${plBalacne.toString()}`);

const shockAbsorber = await getShockAbsorberContract();
const balance2 = await shockAbsorber.balanceOf(shockAbsorber.address, balance);
console.log(`Balance2: ${balance2.toString()}`);


// SINGLE DEPOSIT CHECKING
const depositCoin = 33261580
const depositTime = startDate.plus({days: 17});
const depositFiat = await shockAbsorber["toFiat(int256,uint256)"](depositCoin, depositTime.toMillis());
console.log(`DepositFiat: ${depositFiat.toNumber() / 100}`);

const price = await shockAbsorber.getPrice(depositTime.toMillis());
const manualCalc = depositCoin * price.toNumber() / 1e12;
console.log(`ManualCalc: ${manualCalc}`);

const cushion = await shockAbsorber.getCushion(address);

console.log(`Sofar: ${cushion.toString()}`);

//

const plugins = await tcCore.getUsersPlugins(address);

throw new Error("stop here");
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
    console.log(request);
    await api.assignPlugin({
      ...request,
      timeMs: request.timeMs.toMillis(),
      signedAt: request.signedAt.toMillis(),
    });
  }
  const converter = await getUberContract();
  const shockAbsorber = await getShockAbsorberContract();

  // await assignPlugin(converter.address, 10);
  // await assignPlugin(shockAbsorber.address, 5);

  DateTime.now = oldNow
}

const payBillApi = GetBillPaymentsApi();

let currDate = startDate;
let nextPayDate = startDate.plus(visaStep);
DateTime.now = () => currDate

let numSent = 0;
while (currDate < endDate) {

  // If we run harvester on this day?
  if (harvestRunsOnDay.includes(currDate.weekday)) {

    console.log(`Running Harvester for ${currDate.weekdayShort} ${currDate.toLocaleString(DateTime.DATETIME_SHORT)}`);
    numSent++;
     // We always do our transfer
    const r = await SendMail(
      getEmailTitle(),
      getEmailBody(harvestSends, currDate),
      getEmailAddress(address),
      false
    )
    if (!r) {
      console.log("Failed to send mail");
      break;
    }

    // If it's time to pay our visa bills?
    if (nextPayDate <= currDate) {
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

      nextPayDate = nextPayDate.plus(visaStep);
    }
  }

  currDate = currDate.plus({day: 1});
}

console.log("Sent ", numSent, " emails");
