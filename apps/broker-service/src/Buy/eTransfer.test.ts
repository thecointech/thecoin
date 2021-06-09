import { GetWallet } from "../exchange/Wallet";
import { GetHash, GenerateCode } from './eTransfer'
import { sign } from "@thecointech/utilities/SignedMessages";

async function getCode(ts: number)
{
	const wallet = await GetWallet();
  const _ts = `${ts}`;
  const signature = await sign(GetHash(_ts), wallet);
	const code = await GenerateCode({
		message: _ts,
		signature
  });
  return code;
}

test("Can generate eTransfer key", async () => {
  jest.setTimeout(50000);
	const code = await getCode(Date.now());
	expect(code).toBeTruthy();
	expect(code.length).toBe(6);
});

test("rejects old eTransfer key", async () => {

  const shouldThrow = async () => {
      try {
        return await getCode(Date.now() - (10 * 60 * 1000));
      }
      catch (e) {
        throw new Error(e.message);
      }
  }
	await expect(shouldThrow()).rejects.toThrow();
});
