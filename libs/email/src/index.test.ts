
import { DateTime } from 'luxon';
import { SendMail, SendDepositConfirmation } from '.'


const IsManualRun = process.argv.find(v => v === "--testNamePattern") !== undefined

it("Can send an email", async () => {

	// I don't want to spam myself, so only run this test if manually requested
  if (!IsManualRun)
    return;

	await SendMail("This is a test mail", "You should be seeing this!")
})

it('correctly sends confirmation', async () => {

  if (!IsManualRun)
    return;

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
