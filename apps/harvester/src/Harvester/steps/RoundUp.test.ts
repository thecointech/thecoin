import currency from 'currency.js';
import { RoundUp } from './RoundUp'

it ("rounds up correctly", async () => {
  const ru = async (amt: number, roundPoint: number) => {
    const ru = new RoundUp({ roundPoint });
    const r = await ru.process({
      state: {
        toETransfer: currency(amt),
      }
    } as any);
    return r.toETransfer?.value;
  }

  expect(await ru(100, 100)).toEqual(100);
  expect(await ru(0.01, 100)).toEqual(100);
  expect(await ru(123, 100)).toEqual(200);
  expect(await ru(12, 39)).toEqual(39);
  expect(await ru(40, 39)).toEqual(78);
})
