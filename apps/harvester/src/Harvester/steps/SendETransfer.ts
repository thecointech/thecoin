import { log } from '@thecointech/logging';
import type { HarvestData, ProcessingStage, UserData } from '../types';
import currency from 'currency.js';
import { notify, notifyError } from '../notify';
import { SendFakeDeposit } from '@thecointech/email-fake-deposit';
import { DateTime } from 'luxon';
import { getValues } from '../scraper';
import { ETransferResult } from '@thecointech/scraper-agent/types';
import { sleep } from '@thecointech/async';
import { BackgroundTaskCallback } from '@/BackgroundTask';

export class SendETransfer implements ProcessingStage {

  readonly name = 'SendETransfer';

  // Don't send less than $10, it's not worth the effort
  minETransfer = 10;

  constructor(config?: Record<string, string|number>) {
    if (config?.minETransfer) {
      this.minETransfer = Number(config.minETransfer);
    }
  }

  async process({chq, state}: HarvestData, user: UserData) {
    if (!state.toETransfer) {
      log.info(`Skipping e-Transfer, no value set`);
      return {}
    }
    if (state.toETransfer.value < this.minETransfer) {
      log.info(`Skipping e-Transfer, value of ${state.toETransfer} is less than minimum of ${this.minETransfer}`);
      return {}
    }

    log.info(`Transferring ${state.toETransfer} to TheCoin`);

    const toTransfer = getTransferAmount(state.toETransfer, chq.balance);
    const confirm = await sendETransfer(toTransfer, user)

    if (confirm.confirmationCode) {
      const harvesterBalance = (state.harvesterBalance ?? currency(0))
        .add(toTransfer);

      log.info(`Successfully transferred ${toTransfer} to TheCoin, new balance ${harvesterBalance}`);

      notify({
        title: 'E-Transfer Successful',
        message: `You've just moved ${toTransfer.format()} into your harvester account.`,
        icon: 'seeds.png',
      });

      // NOTE: This will mean the chqBalance is now incorrect, as the money
      // transferred should have modified it
      return {
        toETransfer: undefined,
        harvesterBalance,
      };
    } else {
      log.error(`Failed to transfer ${toTransfer} to TheCoin`);
      // TODO: Handle this case

      notifyError({
        title: 'E-Transfer Failed',
        message: 'Failed to send an e-transfer.  Please contact support.',
      });
    }
    return {};
  }
}

const getTransferAmount = (toETransfer: currency, balance: currency) => {

  // Always leave _something_ in the chequing account
  // Not sure we ever want to leave a balance of $0
  const maxTransfer = balance.subtract(5);
  if (maxTransfer.value < toETransfer.value) {
    log.warn(`Insufficient chq balance, need ${toETransfer}, got ${balance}`);
    return maxTransfer;
  }
  return toETransfer;
}

async function sendETransfer(amount: currency, {wallet, uiCallback}: UserData) : Promise<ETransferResult> {
  if (process.env.HARVESTER_DRY_RUN) {
    await mockUiUpdate(uiCallback);
    return {
      confirmationCode: "DRYRUN"
    }
  }
  else if (process.env.CONFIG_NAME == "prod" || process.env.CONFIG_NAME == "prodbeta") {
    return getValues('chqETransfer', uiCallback, { amount: amount.toString() })
  }
  else {
    await mockUiUpdate(uiCallback);
    // We still send in testing environments
    if (process.env.CONFIG_NAME == "prodtest" || process.env.CONFIG_NAME == "devlive") {
      const address = await wallet.getAddress();
      // Only send while the market is open
      const sendTime = getMockSendTime()
      await SendFakeDeposit(address, amount.value, sendTime);
    }
    return {
      confirmationCode: "1234"
    }
  }
}

async function mockUiUpdate(uiCallback?: BackgroundTaskCallback) {
  if (uiCallback) {
    for (let i = 0; i < 10; i++) {
      uiCallback({
        id: "chqETransfer",
        type: "replay",
        percent: i * 10,
      })
      await sleep(250);
    }
    uiCallback({
      id: "chqETransfer",
      type: "replay",
      percent: 100,
      completed: true,
    })
  }
}

let counter = 0;
function getMockSendTime() {
  const now = DateTime.now();
  // In devlive it's annoying to wait for market open
  if (process.env.CONFIG_NAME !== "devlive") {
    return now;
  }
  if (now.weekday < 5 && now.hour > 10 && now.hour < 16) {
    return now;
  }
  // increment the counter so we don't recieve emails at exactly the
  // same ms.  This is only for a single execution of the app, but
  // that should be sufficient for devlive
  const marketOpen = now.set({ hour: 10, minute: 30 + counter++ });
  const daysSinceOpen = (
    Math.max(now.weekday - 5, 0) + // go to before the weekend
    (now.hour < 10 ? 1 : 0) // add an additional before opening
  );
  return marketOpen.minus({ day: daysSinceOpen });
}
