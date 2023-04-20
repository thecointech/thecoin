import { log } from '@thecointech/logging';
import { replay } from '../../scraper/replay';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';


export class SendETransfer implements ProcessingStage {

  async process({state}: HarvestData) {
    if (state.toETransfer) {
      log.info(`Transferring ${state.toETransfer} to TheCoin`);
      const confirm = await sendETransfer(state.toETransfer)
      if (confirm.confirm) {
        log.info(`Successfully transferred ${state.toETransfer} to TheCoin`);
        const currBalance = state.harvesterBalance ?? currency(0);
        return {
          toETransfer: undefined,
          harvesterBalance: currBalance.add(state.toETransfer),
        }
      } else {
        log.error(`Failed to transfer ${state.toETransfer} to TheCoin`);
        // TODO: Handle this case
      }
    }
    return {};
  }
}

const sendETransfer = (amount: currency) =>
  process.env.CONFIG_NAME == "prod" || process.env.CONFIG_NAME == "prodbeta"
    ? replay('chqETransfer', { amount: amount.toString() })
    : { confirm: "1234" };
