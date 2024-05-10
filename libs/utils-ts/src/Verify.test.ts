import { it } from "@jest/globals";
import { sign } from './SignedMessages';
import { Wallet } from 'ethers'
import { buildUniqueId } from './Verify';
import { verifyMessage } from 'ethers';

it ("generates appropriate tests", async () => {
  const data = {
    given_name: "GIVEN",
    family_name: "FAMILY",
    DOB: "1/2/3456",
  };
  const signer = Wallet.createRandom();
  const uniqueId = buildUniqueId(data);
  const uniqueIdSig = await sign(uniqueId, signer);
  const verified = verifyMessage(uniqueId, uniqueIdSig);
  expect(verified).toEqual(await signer.getAddress());
});
