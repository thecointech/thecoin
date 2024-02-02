import { getSigner } from "@thecointech/signers";
import { randomBytes } from "crypto";
import { DateTime } from "luxon";

import { SendMail } from '@thecointech/email';

// Init/Demo account
// Starting from Jan 1 2022
// Send a deposit email to


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


const signer = await getSigner("testDemoAccount");
const address = await signer.getAddress();

const body = getEmailBody(350, DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
  hour: 8,
  minute: 35
}));


import { Base64 } from 'js-base64';

const enc = Base64.encode(body);
console.log(enc);

// await SendMail(
//   getEmailTitle(),
//   body,
//   getEmailAddress(address),
// )
