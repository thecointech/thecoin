import { GetContract } from "./TheContract";
import { Wallet } from "ethers";
import { BuildVerifiedSale, GetSaleSigner } from "./VerifiedSale";
import { BrokerCAD } from "@the-coin/types";

test('Can build verified sale', async () => {

	const contract = await GetContract();
	expect(contract.address).toBeDefined();

	const email: BrokerCAD.ETransferPacket = {
    email: "address@email.com",
    secret: "secret"
  }
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
