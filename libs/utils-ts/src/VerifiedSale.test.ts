import { Wallet } from "ethers";
import { BuildVerifiedSale } from "./VerifiedSale";
import { getSigner } from "./VerifiedAction";
import type { ETransferPacket } from "@thecointech/types";

it('Can build verified sale', async () => {

	const eTransfer: ETransferPacket = {
    email: "address@email.com",
    question: "question",
    answer: "answer"
  }
	const wallet = Wallet.createRandom();
	const value = 100000;
	const fee = 2000;
	const sale = await BuildVerifiedSale(eTransfer, wallet, wallet.address, value, fee);

	// verify that our email signature is valid
	const signer = getSigner(sale);
	expect(signer).toMatch(wallet.address);
})
