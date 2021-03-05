
import { GetContract, GetWallet } from './Wallet'
import { toHuman } from '@the-coin/utilities'
import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { DoCertifiedSale } from './VerifiedSale'
import { ETransferPacket } from '../types';
import { init, describe } from '@the-coin/utilities/firestore/jestutils';
import { CertifiedTransferRecord } from '@the-coin/utilities/firestore';
import { current } from '../status';

beforeAll(async () => {
  init('broker-cad-billpayments');
});

it("has valid status", async () => {
  const curr = await current();
  expect(curr.BrokerCAD);
  expect(curr.BrokerCAD.length).toBe(42);
  const fee = toHuman(curr.certifiedFee);
  expect(fee).toBe(0.005);
})

describe('Test certified sale actions', () => {

  test("Certified sale completes sale properly", async () => {

    jest.setTimeout(900000);
    const wallet = await GetWallet();
    const address = await wallet.getAddress();
    expect(wallet).toBeDefined();

    // TODO!  Create a testing account to handle this stuff!
    const tc = await GetContract();
    const myBalance = await tc.balanceOf(address)
    expect(myBalance.toNumber()).toBeGreaterThan(0);

    const eTransfer: ETransferPacket = {
      email: "test@random.com",
      question: "vvv",
      answer: "lskdjf"
    };

    const curr = await current();
    const fee = curr.certifiedFee;
    const sellAmount = 100;
    const certSale = await BuildVerifiedSale(eTransfer, wallet, curr.BrokerCAD, sellAmount, fee);
    const tx = await DoCertifiedSale(certSale);

    expect(tx).toBeTruthy();
    expect(tx.hash).toBeDefined()
    expect(tx.doc).toBeDefined()

    // Wait on the given hash for 2 confirmations
    let receipt = await tc.provider.getTransactionReceipt(tx.hash);
    console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`);

    // We await 2 confirmations internally
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    while (!receipt.confirmations || receipt.confirmations < 2) {
      await delay(1000);
      receipt = await tc.provider.getTransactionReceipt(tx.hash);
    }

    // Wait one more second to make sure the datastore has been updated;
    // Check that the datastore now has the right values
    await delay(1000);

    // Verify money was subtracted
    const newBalance = await tc.balanceOf(address)
    // Note, this number can sometimes be messed up if multiple
    // tests are runnin a the same time.  It's an issue
    // with using the same wallet for testing that processed the tx's
    expect(newBalance.toNumber()).toBe(myBalance.toNumber() - sellAmount);

    const r = await tx.doc.get();
    const record = r.data() as CertifiedTransferRecord;
    expect(record.hash).toEqual(tx.hash);
    //expect(record.clientEmail).toEqual(email);
    expect(record.confirmed).toEqual(true);
    expect(record.fiatDisbursed).toEqual(0);
  })
})
