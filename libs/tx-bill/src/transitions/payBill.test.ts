import { encrypt } from '@thecointech/utilities/Encrypt';
import { payBill } from './payBill';
import { getMockContainer } from '../../internal/mockContainer';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

const testData = {
  payee: "test payee",
  accountNumber: "1234567890",
}

it ('can process a bill payment', async () => {
  // Setup Mock container for paying bill
  const container = await getMockContainer(DateTime.now());
  const currentState = container.history[0];
  currentState.delta.type = "preTransfer";
  currentState.data.fiat = new Decimal(1000)
  container.action.data.initial.instructionPacket = encrypt(testData)
  const r = await payBill(container);
  expect(r.meta).toBeTruthy();
  expect(r.fiat.eq(0)).toBeTruthy();
})
