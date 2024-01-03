import { log } from '@thecointech/logging';
import type { HarvestData, ProcessingStage, UserData, Replay } from '../types';
import currency from 'currency.js';
import { notify, notifyError } from '../notify';

export class SendETransfer implements ProcessingStage {

  // Don't send less than $10, it's not worth the effort
  minETransfer = 10;

  constructor(config?: Record<string, string|number>) {
    if (config?.minETransfer) {
      this.minETransfer = Number(config.minETransfer);
    }
  }

  async process({chq, state}: HarvestData, {replay}: UserData) {
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
    const confirm = await sendETransfer(toTransfer, replay)

    if (confirm.confirm) {
      const harvesterBalance = (state.harvesterBalance ?? currency(0))
        .add(toTransfer);

      log.info(`Successfully transferred ${toTransfer} to TheCoin, new balance ${harvesterBalance}`);

      notify({
        title: 'E-Transfer Successful',
        message: `You've just moved ${toTransfer.format()} into your harvester account.`,
        icon: 'seeds.png',
      });

      return {
        toETransfer: undefined,
        harvesterBalance,
      }
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
  // Limit the amount we send to $3000
  const toETransferLimit = currency(3000);
  if (toETransfer.value > toETransferLimit.value) {
    // If the e-transfer is limited, that's mostly fine,
    // the next time we run the missing balance will get picked up.
    log.warn(`Requested e-transfer is too large: ${toETransfer}, max ${toETransferLimit}`);
    toETransfer = toETransferLimit;
  }

  // Always leave _something_ in the chequing account
  // Not sure we ever want to leave a balance of $0
  const maxTransfer = balance.subtract(5);
  if (maxTransfer.value < toETransfer.value) {
    log.warn(`Insufficient chq balance, need ${toETransfer}, got ${balance}`);
    return maxTransfer;
  }
  return toETransfer;
}

const sendETransfer = (amount: currency, replay: Replay) =>
  process.env.CONFIG_NAME == "prod" || process.env.CONFIG_NAME == "prodbeta"
    ? replay('chqETransfer', { amount: amount.toString() })
    : { confirm: "1234" };
