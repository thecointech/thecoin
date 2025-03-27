import { jest } from '@jest/globals';
import { processActions, processTransfers } from '.';
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { RbcApi } from '@thecointech/rbcapi';
import { DateTime } from 'luxon';
import { TxActionType } from '@thecointech/broker-db';
import { init } from '@thecointech/firestore';
import { getBuyETransferAction } from '@thecointech/tx-deposit';
import Decimal from 'decimal.js-light';
import { Wallet } from 'ethers';
import { getBillAction } from '@thecointech/tx-bill';
import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { log } from '@thecointech/logging';
jest.setTimeout(900000);

init({});
log.level(100)
const brokerCad = await getSigner("BrokerCAD");
const theContract = await ConnectContract(brokerCad);
const bank = await RbcApi.create();
const user = Wallet.createRandom();

it("does not continue processing user with failed transactions", async () => {

  const xfer = await BuildVerifiedBillPayment(
    {
      accountNumber: "1234",
      payee: "asdf",
    },
    user,
    process.env.WALLET_BrokerCAD_ADDRESS!,
    100,
    0
  );
  const billAction = await getBillAction(xfer);

  const actions = [
    billAction,
    billAction,
  ];
  const r = await processActions(actions, theContract, bank);
  expect(r.length).toEqual(1);
})

it ("continues if deposits have issues", async () => {
  const action = await getBuyETransferAction({
    address: Wallet.createRandom().address,
    id: "asdf",
    cad: new Decimal(1),
    recieved: DateTime.now(),
  } as any)

  const actions = [
    action,
    action,
  ];
  const r = await processActions(actions, theContract, bank);
  expect(r.length).toEqual(2);
})
