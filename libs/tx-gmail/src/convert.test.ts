import { toDepositData } from "./convert";
//@ts-ignore Import directly from mocks to skip auth part.
import emails from '../../__mocks__/googleapis/emails.get.json' assert {type: "json"};

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
