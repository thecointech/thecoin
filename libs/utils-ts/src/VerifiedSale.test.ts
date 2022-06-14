import { Wallet } from "ethers";
import { BuildVerifiedSale } from "./VerifiedSale.js";
import { getSigner } from "./VerifiedAction.js";
import { ETransferPacket } from "@thecointech/types";

it('Can build verified sale', async () => {

  jest.setTimeout(30000);

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
