import { SendMail } from '@thecointech/email';
import { randomBytes } from "crypto";
import { DateTime } from 'luxon';
import yargs from 'yargs';
import { log } from '@thecointech/logging';

async function fakeDepositEmail(address: string, amount: number) {

  const randomId = randomBytes(4).toString('hex');
  const p1 = randomBytes(32).toString('hex');
  const expiry = DateTime.now().plus({month: 1})
  log.debug(`Sending $${amount} to ${address}`);

  SendMail(
    "INTERAC e-Transfer: (fake deposit) has sent you money.",
    `
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

=C2=AE Trade-mark of Interac Corp.  Used under license.`,
    `${address}@test.thecoin.io`,
  )
}

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 -amt [num] -addr [num]')
  .default({ 'amt': 10, addr: "0x445758e37f47b44e05e74ee4799f3469de62a2cb"})  // TestAccNoT
  .argv;

fakeDepositEmail(argv.addr, argv.amt);
