import { toDepositData } from "./convert";
//@ts-ignore Import directly from mocks to skip auth part.
import emails from '../../__mocks__/googleapis/emails.get.json' with { type: "json" }
import { DateTime } from "luxon";

it('processes emails correctly', async () => {
  for (const email of emails) {
    const eTransfer = toDepositData(email.data);
    expect(eTransfer).toBeTruthy();
    // ensure these are all test emails;
    expect(['Not found', 'Some Person']).toContain(eTransfer!.name);
    // ensure we have sourceID;
    expect(eTransfer?.id).toBeTruthy();
  }
})


it('Allows prodtest override', async () => {
  // Find the one with an override
  const { data } = emails.find(e => e.data.labelIds.includes('ProdTestOverride'));
  expect(data).toBeTruthy();

  const regData = toDepositData(data);
  process.env.CONFIG_NAME = "prodtest";
  const ptData = toDepositData(data);
  expect(regData.recieved).toEqual(DateTime.fromISO('2021-07-19T18:51:56.000-04:00'));
  expect(ptData.recieved).toEqual(DateTime.fromISO('2023-01-02T09:35:00.000-05:00'))
})
