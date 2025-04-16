import { HarvestData, ProcessingStage, UserData } from '../types';
import { log } from '@thecointech/logging';
import { getBalance } from './utils';
import { notify } from '../notify';
import currency from 'currency.js';

// Ensure the harvester balance is not lower than the last run
// The harvester tracks it's own balance, separate from the account itself
// This is to ensure that it isn't thrown off by the human actions or by
// the account gaining profit etc.
// However, this may lead to cases where the harvester expects the
// balance to be higher than it actually is, eg - if the user has
// withdrawn some of their balance or the account has a loss.
// In these cases, the harvester may request a visa payment that the
// account balance cannot cover.
//
// This component enforces the balance of the harvester to ensure
// it will never be short when it comes time to pay the visa.
export class EnsureHarvesterBalance implements ProcessingStage {

  readonly name = 'EnsureHarvesterBalance';

  async process(data: HarvestData, user: UserData) {
    if (!data.state.harvesterBalance) return {}

    // This balance will incorporate UberTransfer delay, however
    // our harvester balance does not.  This means to find an
    // accurate balance we subtract the pending visa payment
    const expectedBalance = data.state.harvesterBalance.subtract(data.state.toPayVisa ?? 0);
    const actualBalance = await getBalance(user);
    if (actualBalance) {
      if (expectedBalance.value > actualBalance) {
        // Re-apply any pending payments
        const newBalance = currency(actualBalance).add(data.state.toPayVisa ?? 0);
        log.warn(`Harvester balance lower than expected, resetting it's balance to ${newBalance} from ${expectedBalance}`)
        await notify({
          title: "Harvester balance lower than expected",
          message: `The harvester expected to have ${newBalance} but only has ${actualBalance}. Resetting stored balance to match.`,
        })

        return {
          harvesterBalance: newBalance,
        }
      }
    }
    return {}
  }
}
