
import { DateTime } from 'luxon';
import { SendMail, SendDepositConfirmation } from '.'
import { describe, IsManualRun } from '@thecointech/jestutils';
import { join } from 'path';

// I don't want to spam myself, so only run this test if manually requested
describe('Manual-Only: We can send emails', () => {

  // Pull release env vars (should contain mailjet key)
  const prodEnv = join(__dirname, "../../../environments/prod.env");
  require('dotenv').config({path: prodEnv})

  it("Can send an email", async () => {
    const r = await SendMail("This is a test mail", "You should be seeing this!");
    expect(r).toBeTruthy();
  })

  it('correctly sends confirmation', async () => {
    const confirmation = await SendDepositConfirmation("stephen.taylor.dev@gmail.com", {
      tx: "https://ropsten.etherscan.io/tx/0x4452cd82eee9312a5c67e8403942dd3ba09ff3111f2507d8ac942dbee1d43949",
      FirstName: "Stephen",
      ProcessDate: DateTime.fromObject({
        year: 2020,
        day: 12,
        month: 1,
        hour: 12,
      }),
      SendDate: DateTime.fromObject({
        year: 2020,
        day: 13,
        month: 1,
        hour: 12,
      }),
    });

    expect(confirmation).toBeTruthy();
  })

}, IsManualRun);
