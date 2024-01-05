
import { toHuman } from '@thecointech/utilities'
import { BuildVerifiedSale } from '@thecointech/utilities/VerifiedSale';
import { ProcessSale } from './VerifiedSale'
import { current } from '../status';
import { ETransferPacket } from '@thecointech/types';
import { init } from '@thecointech/firestore';
import { Wallet } from 'ethers';
import { getActionsForAddress } from '@thecointech/broker-db/transaction';

beforeAll(async () => {
  init({ project: 'broker-cad-billpayments' });
});

it("has valid status", async () => {
  const curr = await current();
  expect(curr.BrokerCAD);
  expect(curr.BrokerCAD.length).toBe(42);
  expect(curr.certifiedFee).toBeDefined();
})

it("Submits a sale for processing", async () => {

  const wallet = Wallet.createRandom();
  expect(wallet).toBeDefined();

  const eTransfer: ETransferPacket = {
    email: "test@random.com",
    question: "vvv",
    answer: "lskdjf"
  };

  const curr = await current();
  const fee = curr.certifiedFee;
  const sellAmount = 100;
  const certSale = await BuildVerifiedSale(eTransfer, wallet, curr.BrokerCAD, sellAmount, fee);
  const res = await ProcessSale(certSale);

  expect(res).toBeTruthy();
  expect(res.hash).toBeDefined();
  expect(res.state).toEqual("tcWaiting")

  // Check that the datastore now has the right values
  const actions = await getActionsForAddress(wallet.address, "Sell");
  expect(actions).toHaveLength(1);
  const [action] = actions;
  // Just make sure we have the right one.
  expect(action.data.initialId).toEqual(certSale.signature);
})
