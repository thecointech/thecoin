import { GetWallet } from "../signer/Wallet";
import { GenerateCode } from './eTransfer'
import { GetSignedMessage } from "@thecointech/utilities/SignedMessages";

async function getCode(ts: number)
{
	const wallet = await GetWallet();
  const message = await GetSignedMessage(ts.toString(), wallet);
	const code = await GenerateCode(message);
  return code;
}

test("Can generate eTransfer key", async () => {
	const code = await getCode(Date.now());
	expect(code).toBeTruthy();
	expect(code.length).toBe(6);
});

test("rejects old eTransfer key", async () => {

  const shouldThrow = async () => {
      try {
        return await getCode(Date.now() - (10 * 60 * 1000));
      }
      catch (e: any) {
        throw new Error(e.message);
      }
  }
	await expect(shouldThrow()).rejects.toThrow();
});
