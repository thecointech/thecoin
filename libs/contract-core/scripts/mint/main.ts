import data from './mint.json' assert {type: "json"};
import { DateTime, Settings } from 'luxon';
import Decimal from 'decimal.js-light';
import { processItems } from './process';
import { NormalizeAddress } from '@thecointech/utilities';
import { AccountName, getSigner } from '@thecointech/signers';
import { getContract } from './contract';
import { log } from '@thecointech/logging';

Settings.throwOnInvalid = true;
Settings.defaultZone = "America/New_York";

export async function ensureAddresses() {
  for (const account of ["BrokerCAD", "TheCoin", "BrokerTransferAssistant", "Minter"]) {
    if (!process.env[`WALLET_${account}_ADDRESS`]) {
      const signer = await getSigner(account as AccountName);
      process.env[`WALLET_${account}_ADDRESS`] = await signer.getAddress();
    }
  }
}

async function ensureBalance() {
  if (process.env.CONFIG_NAME == "devlive") {
    const clientAddress = data[0].originator;
    const mtCore = await getContract("Minter");
    if ((await mtCore.balanceOf(clientAddress)).gt(0))
      return;

    log.info("Seeding devlive accounts");
    const v = 5367298488 * 4;
    const tcCore = await getContract("TheCoin");
    const tcAddress = await tcCore.signer.getAddress();
    const timestamp = DateTime.fromSQL("2017-01-01").toMillis();
    await mtCore.mintCoins(v, tcAddress, timestamp);
    await tcCore.runCloneTransfer(tcAddress, clientAddress, v, 0, timestamp);
    log.trace("Seed Complete...");
  }
}

(async() => {
  await ensureAddresses();
  await ensureBalance();

  processItems(data.map(d => ({
    originator: NormalizeAddress(d.originator),
    date: DateTime.fromISO(d.date),
    fiat: new Decimal(d.fiat),
    currency: d.currency as "USD"|"CAD",
  })));
})()

