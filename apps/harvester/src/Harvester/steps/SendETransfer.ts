import { log } from '@thecointech/logging';
import type { HarvestData, ProcessingStage, UserData } from '../types';
import currency from 'currency.js';
import { notify, notifyError } from '@/notify';
import { SendFakeDeposit } from '@thecointech/email-fake-deposit';
import { DateTime } from 'luxon';
import { getValues } from '../replay';
import { ETransferResult } from '@thecointech/scraper-agent/types';

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

async function sendETransfer(amount: currency, {wallet, callback}: UserData) : Promise<ETransferResult> {
  if (process.env.HARVESTER_DRY_RUN) {
    // await mockUiUpdate(callback);
    return {
      confirmationCode: "DRYRUN"
    }
  }
  const r = await getValues('chqETransfer', callback, { amount: amount.toString() })

  // In testing environments we send the fake deposit
  if (process.env.CONFIG_NAME == "prodtest" || process.env.CONFIG_NAME == "devlive") {
    const address = await wallet.getAddress();
    // Make dev-live responsive, only send while the market is open
    const sendTime = (process.env.CONFIG_NAME == "devlive")
      ? getMockSendTime(DateTime.now())
      : DateTime.now();
    await SendFakeDeposit(address, amount.value, sendTime);
  }
  return r
}

let counter = 0;
export function getMockSendTime(now: DateTime) {
  // If now is during market hours, use it.
  if (now.weekday < 5 && now.hour > 10 && now.hour < 16) {
    return now;
  }
  // increment the counter so we don't recieve emails at exactly the
  // same ms.  This is only for a single execution of the app, but
  // that should be sufficient for devlive
  const marketOpen = now.set({ hour: 10, minute: 30 }).plus({ minutes: counter++ });
  let daysSinceOpen = Math.max(now.weekday - 5, 0);
  if (daysSinceOpen == 0 && now.hour < 10) {
    daysSinceOpen = now.weekday == 1 ? 3 : 1;
  }
  return marketOpen.minus({ day: daysSinceOpen });
}
