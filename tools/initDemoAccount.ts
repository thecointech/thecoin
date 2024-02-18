import { getSigner } from "@thecointech/signers";
import { randomBytes } from "crypto";
import { DateTime, Duration } from "luxon";

import { SendMail } from '@thecointech/email';
import { GetPluginsApi, GetBillPaymentsApi } from '@thecointech/apis/broker';
import { GetContract } from '@thecointech/contract-core';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getContract as getShockAbsorberContract } from '@thecointech/contract-plugin-shockabsorber';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';

// Init/Demo account
// Starting from Jan 1 2022
// Send a deposit email to

const signer = await getSigner("testDemoAccount");
const address = await signer.getAddress();
const startDate = DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
  hour: 9,
  minute: 35
})
const endDate = startDate.plus({month: 1});
const visaStep = Duration.fromObject({week: 4});
const weeklySpending = 350;
const harvestRunsOnDay = [
  2, // Monday
  5, // Thursday
]

export const getEmailTitle = () => "[REDIRECT:] INTERAC e-Transfer: (fake deposit) has sent you money."
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
const plugins = await tcCore.getUsersPlugins(address);
if (plugins.length == 0) {
  const oldNow = DateTime.now

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
  await assignPlugin(shockAbsorber.address, 5);

  DateTime.now = oldNow
}

// let currDate = startDate;
// let visa = startDate;
// let nextPayDate = visa.plus(visaStep);
// while (currDate < endDate) {
//   // We do something on this date
//   const toSend = (weeklySpending / harvestRunsOnDay.length);
//   if (harvestRunsOnDay.includes(currDate.weekday)) {
//     await SendMail(
//       getEmailTitle(),
//       getEmailBody(toSend, currDate),
//       getEmailAddress(address),
//     )
//   }
//   if (nextPayDate == currDate) {
//     BrokerApi.sendDeposit(toSend, currDate, address, signer);
//   }
//   visa = nextPayDate;
//   nextPayDate = nextPayDate.plus(visaStep);
//   currDate = currDate.plus({day: 1});
// }

// const body = getEmailBody(toSend, DateTime.fromObject({
//   year: 2023,
//   month: 1,
//   day: 2,
//   hour: 8,
//   minute: 35
// }));


// import { Base64 } from 'js-base64';

// const enc = Base64.encode(body);
// console.log(enc);

// await SendMail(
//   getEmailTitle(),
//   body,
//   getEmailAddress(address),
// )
