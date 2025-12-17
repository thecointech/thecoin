import { jest } from '@jest/globals';
import { processActions } from '.';
import { ContractCore } from '@thecointech/contract-core';
import { RbcApi } from '@thecointech/rbcapi';
import { DateTime } from 'luxon';
import { init } from '@thecointech/firestore';
import { getBuyETransferAction } from '@thecointech/tx-deposit';
import Decimal from 'decimal.js-light';
import { Wallet } from 'ethers';
import { getBillAction } from '@thecointech/tx-bill';
import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
jest.setTimeout(900000);

init({});
log.level(100)
const signer = await getSigner("BrokerCAD");
const theContract = await ContractCore.connect(signer);
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
    { ...billAction, executeDate: 1 },
    { ...billAction, executeDate: 2 },
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
    { ...action, executeDate: 1 },
    { ...action, executeDate: 2 },
  ];
  const r = await processActions(actions, theContract, bank);
  expect(r.length).toEqual(2);
})
