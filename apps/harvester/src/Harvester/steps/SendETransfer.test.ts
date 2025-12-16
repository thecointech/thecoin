import currency from 'currency.js';
import { getMockSendTime, SendETransfer } from './SendETransfer'
import { mockLog } from '../../../internal/mockLog';
import { DateTime } from 'luxon';
import { mockUser } from '../../../internal/mockUser';

const user = mockUser();

it ('will send an e-transfer', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(10),
    },
  } as any, user)
  expect(d.harvesterBalance).toEqual(currency(10))
  expect(d.toETransfer).toBeUndefined();
})

it ('Does not send an insignificant amount', async () => {
  const msgs = mockLog();
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(5),
    },
  } as any, user)
  expect(msgs).toContain("Skipping e-Transfer, value of 5.00 is less than minimum of 10");
  expect(d.harvesterBalance).toBeUndefined()
  expect(d.toETransfer).toBeUndefined();
})


it ('will not send more than chq balance', async () => {
  const msgs = mockLog();
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(200),
    },
  } as any, user)
  expect(msgs).toContain("Insufficient chq balance, need 200.00, got 100.00");
  expect(d.harvesterBalance).toEqual(currency(95))
  expect(d.toETransfer).toBeUndefined();
})

it ('mocks a decent send time', async () => {
  const sundayMorning = DateTime.now().set({weekday: 7, hour: 7, minute: 0})
  const m1 = getMockSendTime(sundayMorning)
  expect(m1.weekday).toEqual(5);
  expect(m1.hour).toEqual(10);
  expect(m1 < sundayMorning).toBeTruthy();

  const mondayMorning = sundayMorning.plus({ day: 1 })
  const m2 = getMockSendTime(mondayMorning)
  expect(m2.weekday).toEqual(5);
  expect(m2.hour).toEqual(10);
  expect(m2 < sundayMorning).toBeTruthy();

  const fridayMorning = sundayMorning.plus({ day: 5 })
  const m3 = getMockSendTime(fridayMorning)
  expect(m3.weekday).toEqual(4);
  expect(m3.hour).toEqual(10);
  expect(m3 < fridayMorning).toBeTruthy();
  expect(m3 > mondayMorning).toBeTruthy();

  const saturdayMorning = sundayMorning.plus({ day: 6 })
  const m4 = getMockSendTime(saturdayMorning)
  expect(m4.weekday).toEqual(5);
  expect(m4.hour).toEqual(10);
  expect(m4 < saturdayMorning).toBeTruthy();
  expect(m4 > fridayMorning).toBeTruthy();

  const sundayEvening = sundayMorning.set({ hour: 18 })
  const m5 = getMockSendTime(sundayEvening)
  expect(m5.weekday).toEqual(5);
  expect(m5.hour).toEqual(10);
  expect(m5 < sundayMorning).toBeTruthy();

  const mondayEvening = mondayMorning.set({ hour: 18 })
  const m6 = getMockSendTime(mondayEvening)
  expect(m6.weekday).toEqual(1);
  expect(m6.hour).toEqual(10);
  expect(m6 > mondayMorning).toBeTruthy();

  const fridayEvening = fridayMorning.set({ hour: 18 })
  const m7 = getMockSendTime(fridayEvening)
  expect(m7.weekday).toEqual(5);
  expect(m7.hour).toEqual(10);
  expect(m7 > fridayMorning).toBeTruthy();
})
