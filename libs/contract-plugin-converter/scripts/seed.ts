import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract } from '@thecointech/contract-plugin-converter';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { fetchRate, weSellAt } from "@thecointech/fx-rates";
import Decimal from "decimal.js-light";
import { toCoinDecimal } from "@thecointech/utilities";
import { connect } from '@thecointech/contract-base/connect';
import { sleep } from '@thecointech/async';

// Assume devlive
if (process.env.CONFIG_NAME !== "devlive") throw new Error("Not Sufficiently Tested");

log.debug("Seeding Converter");
async function main() {
  const tester = await getSigner("uberTester");
  const theCoin = await getSigner("TheCoin");
  const owner = await getSigner("Owner");
  const brokerCad = await getSigner("BrokerCAD");
  const testAddress = await tester.getAddress();
  const tcAddress = await theCoin.getAddress();

  const converter = await getContract();
  const bcCore = await ConnectContract(brokerCad);
  const tcCore = await ConnectContract(theCoin);
  const ownConvert = connect(owner, converter);

  // In DevLive, we assign the converter to uberTester
  const request = await buildAssignPluginRequest(tester, converter.address, ALL_PERMISSIONS);
  await assignPlugin(bcCore, request);

  // We cannot know if the rates service has finished initializing yet
  await waitForRatesService()

  // Simulate the hack:
  // For the past year, deposit $100 every week, spend $400 every 4 weeks, delayed by 3 weeks
  let start = DateTime.now().minus({ year: 1});
  for (let i = 0; i < 52; i++) {
    const now = start.plus({ weeks: i });
    // every week, we transfer $100 in
    const fxRate = await fetchRate(now.toJSDate());
    const sellRate = weSellAt([fxRate], now.toJSDate());
    const dep = toCoinDecimal(new Decimal(100).div(sellRate));
    await bcCore.exactTransfer(testAddress, dep.toNumber(), now.toMillis());

    // Every 4 weeks, we allocate $400 to future visa bill
    if (i > 0 && i % 4 == 0) {
      const dueDate = now.plus({ weeks: 3 });
      await ownConvert.seedPending(testAddress, tcAddress, 400e2, dueDate.toMillis(), now.toMillis());
    }
    else if (i > 3 && i % 4 == 3) {
      await ownConvert.processPending(testAddress, tcAddress, now.toMillis());
    }
  }
}

async function waitForRatesService() {
  for (let i = 0; i < 100; i++) {
    try {
      if (i % 10 == 0) {
        log.trace("Waiting for rates service");
      }
      const fxRate = await fetchRate(new Date());
      return;
    } catch (e) {
      if (i == 99) {
        log.error("Failed to get rates service");
        throw e;
      }
      await sleep(1500);
    }
  }
}

main()
