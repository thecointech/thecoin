import { jest } from "@jest/globals";
import currency from 'currency.js';
import { notify, notifyError } from './notify';
import { IsManualRun, describe } from '@thecointech/jestutils';

jest.setTimeout(10 * 1000);
describe('test notifications', () => {
  beforeEach(() => {
    delete process.env.RUNTIME_ENV;
  })
  // Allow posting toasts
  // NOTE: These tests all seem to hang in Jest,
  // but the functionality runs fine in electron
  it('shows a notification', async () => {
    await notify({
      title: 'E-Transfer Successful',
      message: `You've just moved ${new currency(10.30).format()} into your harvester account.`,
      icon: 'money.png',
    });
  })

  it('shows a notification with action', async () => {
    const r = await notify({
      title: 'Transfering to TheCoin',
      message: `Click yes to transfer ${new currency(10.30).format()} to TheCoin.`,
      icon: 'growth.png',
      // actions: ["Yes", "No"],
    });

    console.log(r);
    // expect(r == 'Yes' || r == 'timeout').toBe(true);
  })

  it('can show an error', async () => {
    const r = await notifyError({
      title: 'Harvester Error',
      message: `Something went wrong.`,
      // actions: ['Retry', 'Cancel']
    });

    // expect(r).toBe('Retry');
  })
}, IsManualRun)
