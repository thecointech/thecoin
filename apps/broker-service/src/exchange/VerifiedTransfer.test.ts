import { GetWallet } from "./Wallet";
import { BuildVerifiedXfer } from "@thecointech/utilities/VerifiedTransfer";
import { DoCertifiedTransferWaitable } from "./VerifiedTransfer";
import { Wallet } from "ethers";
import { GetContract } from "@thecointech/contract";
import { init, describe } from '@thecointech/utilities/firestore/jestutils';
import {current} from '../status';

beforeAll(async () => {
  init('broker-cad-billpayments');
});

test("Transfer checks balance", async () => {
  jest.setTimeout(180000);
	const wallet = Wallet.createRandom();
  const status = await current();
	const certTransfer = await BuildVerifiedXfer(wallet, status.BrokerCAD, 100, status.certifiedFee);
	await expect(DoCertifiedTransferWaitable(certTransfer)).rejects.toThrow("Insufficient funds");
})


test("Transfer checks fee", async () => {
	const wallet = Wallet.createRandom();
  const status = await current();
	const certTransfer = await BuildVerifiedXfer(wallet, status.BrokerCAD, 100, 0);
	await expect(DoCertifiedTransferWaitable(certTransfer)).rejects.toThrow("Invalid fee present");
})

describe('Test certified transfer actions', () => {

  test("Transfer completes sale properly", async () => {
    jest.setTimeout(180000);

    const wallet = await GetWallet();
    const tc = await GetContract();
    expect(wallet).toBeDefined();
    const address = await wallet.getAddress();

    // TODO!  Create a testing account to handle this stuff!
    const myBalance = await tc.balanceOf(address)
    expect(myBalance.toNumber()).toBeGreaterThan(0);

    const transfer = 100;
    const status = await current();
    const certTransfer = await BuildVerifiedXfer(wallet, address, transfer, status.certifiedFee);
    const tx = await DoCertifiedTransferWaitable(certTransfer);

    expect(tx.hash).toBeTruthy();

    // Wait on hash to check it successfully xfer'ed
    const response = await tc.provider.getTransaction(tx.hash!);
    const receipt = await response.wait();

    expect(receipt).toBeTruthy();

    //await awaiter;
    console.log("finished");
  })
})
