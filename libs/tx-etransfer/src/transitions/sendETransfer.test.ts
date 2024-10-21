import { encrypt } from '@thecointech/utilities/Encrypt';
import { sendETransfer } from './sendETransfer';
import { getMockContainer } from '../../internal/mockContainer';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

const testData = {
  question: "test data",
  answer: "test_data",
  email: "test@data",
}

it ('can process an etransfer', async () => {
  // Setup Mock container for etransfer
  const container = await getMockContainer(DateTime.now());
  const currentState = container.history[0];
  currentState.delta.type = "preTransfer";
  currentState.data.fiat = new Decimal(1000)
  container.action.data.initial.instructionPacket = encrypt(testData)
  const r = await sendETransfer(container);
  expect(r.meta).toBeTruthy();
  expect(r.fiat.eq(0)).toBeTruthy();
})
