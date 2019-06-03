import { GetContract } from "./TheContract";
import { Wallet } from "ethers";
import { BuildVerifiedSale, GetSaleSigner } from "./VerifiedSale";

test('Can build verified sale', async () => {

	const contract = GetContract();
	expect(contract.address).toBeDefined();

	const email = "address@email.com";
	const wallet = Wallet.createRandom();
	const value = 100000;
	const fee = 2000;
	const sale = await BuildVerifiedSale(email, wallet, wallet.address, value, fee);
	
	// verify that the transfer is avlid
	const { transfer } = sale;
	var xferSigner = await contract.recoverSigner(transfer.from, transfer.to, transfer.value, transfer.fee, transfer.timestamp, transfer.signature);
	expect(xferSigner).toMatch(wallet.address);

	// verify that our email signature is valid
	const signer = GetSaleSigner(sale);
	expect(signer).toMatch(wallet.address);
})
