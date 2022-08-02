import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { ProcessBillPayment } from './VerifiedBillPayments'
import { init } from '@thecointech/firestore';
import { current } from '../status';
import { BillPayeePacket } from '@thecointech/types';
import { getActionsForAddress } from '@thecointech/broker-db/transaction';
import { Wallet } from 'ethers';

beforeEach(async () => {
  init({});
});

it("can process a bill payment", async () => {

  const wallet = Wallet.createRandom();

  const payee: BillPayeePacket = {
    payee: "VISA - TORONTO DOMINION",
    accountNumber: "123456789123546"
  };
  const amount = 100;
  const curr = await current();
  const billPayment = await BuildVerifiedBillPayment(payee, wallet, curr.BrokerCAD, amount, curr.certifiedFee);
  expect(billPayment).toBeTruthy();
  const res = await ProcessBillPayment(billPayment);

  expect(res).toBeTruthy();
  expect(res.hash).toBeDefined()
  expect(res.state).toEqual("tcWaiting")

  // Check that the datastore now has the right values
  const actions = await getActionsForAddress(wallet.address, "Bill");
  expect(actions).toHaveLength(1);
  const [action] = actions;
  // Just make sure we have the right one.
  expect(action.data.initialId).toEqual(billPayment.signature);
})

