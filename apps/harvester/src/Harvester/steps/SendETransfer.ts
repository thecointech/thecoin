import { log } from '@thecointech/logging';
import { replay } from '../../scraper/replay';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';


export class SendETransfer implements ProcessingStage {

  async process(data: HarvestData) {
    if (data.toETransfer) {
      log.info(`Transferring ${data.toETransfer} to TheCoin`);
      const confirm = await sendETransfer(data.toETransfer)
      // const confirm = await replay('chqETransfer', { amount: data.toCoin.toString() });
      if (confirm.confirm) {
        log.info(`Successfully transferred ${data.toETransfer} to TheCoin`);
        data.coinBalance = data.coinBalance.add(data.toETransfer);
        data.toETransfer = undefined;
      } else {
        log.error(`Failed to transfer ${data.toETransfer} to TheCoin`);
        // TODO: Handle this case
      }
    }
    return data;
  }
}

const sendETransfer = (amount: currency) =>
  process.env.CONFIG_NAME == "prod" || process.env.CONFIG_NAME == "prodbeta"
    ? replay('chqETransfer', { amount: amount.toString() })
    : { confirm: "1234" };
