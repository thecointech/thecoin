import { replay } from '../../scraper/replay';
import { HarvestData, ProcessingStage } from '../types';


export class TransferVisaOwing implements ProcessingStage {

  async process(data: HarvestData) {
    if (data.toCoin) {
      console.log(`Transferring ${data.toCoin} to TheCoin`);
      const confirm = await replay('chqETransfer', { amount: data.toCoin.toString() });
      if (confirm.confirm) {
        console.log(`Successfully transferred ${data.toCoin} to TheCoin`);
        data.coinBalance = data.coinBalance.add(data.toCoin);
        data.toCoin = undefined;
      } else {
        console.log(`Failed to transfer ${data.toCoin} to TheCoin`);
        // TODO: Handle this case
      }
    }
    return data;
  }
}
