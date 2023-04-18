import { log } from '@thecointech/logging';
import { replay } from '../../scraper/replay';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';


export class SendETransfer implements ProcessingStage {

  async process(data: HarvestData) {
    if (data.toCoin) {
      log.info(`Transferring ${data.toCoin} to TheCoin`);
      const confirm = await sendETransfer(data.toCoin)
      // const confirm = await replay('chqETransfer', { amount: data.toCoin.toString() });
      if (confirm.confirm) {
        log.info(`Successfully transferred ${data.toCoin} to TheCoin`);
        data.coinBalance = data.coinBalance.add(data.toCoin);
        data.toCoin = undefined;
      } else {
        log.error(`Failed to transfer ${data.toCoin} to TheCoin`);
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
