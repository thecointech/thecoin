import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { ProcessUberBillPayment } from './uberBillPayment'
import { init } from '@thecointech/firestore';
import { current } from '../status';
import { getActionsForAddress } from '@thecointech/broker-db/transaction';
import { Wallet } from 'ethers';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

beforeEach(async () => {
  init({});
});

it("can process an uber bill payment", async () => {

  const wallet = Wallet.createRandom();
  const amount = new Decimal(100);
  const curr = await current();
  const billPayment = await BuildUberAction({} as any, wallet, curr.BrokerCAD, amount, 124, DateTime.now().plus({minutes: 5}));
  expect(billPayment).toBeTruthy();
  const res = await ProcessUberBillPayment(billPayment);

  expect(res).toBeTruthy();
  expect(res.hash).toBeDefined()
  expect(res.state).toEqual("tcRegisterWaiting")

  // Check that the datastore now has the right values
  const actions = await getActionsForAddress(wallet.address, "Bill");
  expect(actions).toHaveLength(1);
  const [action] = actions;
  // Just make sure we have the right one.
  expect(action.data.initialId).toEqual(billPayment.signature);
})

