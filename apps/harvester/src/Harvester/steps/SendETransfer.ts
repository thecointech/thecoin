import { log } from '@thecointech/logging';
import { replay } from '../../scraper/replay';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';


export class SendETransfer implements ProcessingStage {

  async process({chq, state}: HarvestData) {
    if (state.toETransfer) {
      log.info(`Transferring ${state.toETransfer} to TheCoin`);
      const toTransfer = getTransferAmount(state.toETransfer, chq.balance);
      const confirm = await sendETransfer(toTransfer)

      if (confirm.confirm) {
        log.info(`Successfully transferred ${state.toETransfer} to TheCoin`);
        const currBalance = state.harvesterBalance ?? currency(0);
        return {
          toETransfer: undefined,
          harvesterBalance: currBalance.add(toTransfer),
        }
      } else {
        log.error(`Failed to transfer ${toTransfer} to TheCoin`);
        // TODO: Handle this case
      }
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

const sendETransfer = (amount: currency) =>
  process.env.CONFIG_NAME == "prod" || process.env.CONFIG_NAME == "prodbeta"
    ? replay('chqETransfer', { amount: amount.toString() })
    : { confirm: "1234" };
