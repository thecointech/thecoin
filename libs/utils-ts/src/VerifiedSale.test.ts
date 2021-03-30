import { GetContract } from "@thecointech/contract";
import { Wallet } from "ethers";
import { BuildVerifiedSale } from "./VerifiedSale";
import { GetSigner } from "./VerifiedAction";
import { ETransferPacket } from "@thecointech/types";

test('Can build verified sale', async () => {

  jest.setTimeout(30000);
	const contract = await GetContract();
	expect(contract.address).toBeDefined();

	const eTransfer: ETransferPacket = {
    email: "address@email.com",
    question: "question",
    answer: "answer"
  }
	const wallet = Wallet.createRandom();
	const value = 100000;
	const fee = 2000;
	const sale = await BuildVerifiedSale(eTransfer, wallet, wallet.address, value, fee);

	// verify that the transfer is avlid
	const { transfer } = sale;
	var xferSigner = await contract.recoverSigner(transfer.from, transfer.to, transfer.value, transfer.fee, transfer.timestamp, transfer.signature);
	expect(xferSigner).toMatch(wallet.address);

	// verify that our email signature is valid
	const signer = GetSigner(sale);
	expect(signer).toMatch(wallet.address);
})
