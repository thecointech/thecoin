import { GetWallet } from "../exchange/Wallet";
import { GetHash, GenerateCode } from './eTransfer'

async function getCode(ts: number)
{
	const wallet = await GetWallet();
	const _ts = `${ts}`;
	return await GenerateCode({
		message: _ts,
		signature: await wallet.signMessage(GetHash(_ts))
	});
}
test("Can generate eTransfer key", async () => {
	const code = await getCode(Date.now());
	expect(code).toBeTruthy();
	expect(code.length).toBe(6);
})

test("rejects old eTransfer key", async () => {
	await expect(getCode(Date.now() - (10 * 60 * 1000))).rejects.toThrow();
})