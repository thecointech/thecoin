import { msTillNearestMinute, waitTillBuffer, BufferMs } from "./delay";

const toMs = (min: number, sec: number, ms: number) =>
  (min * 60 * 1000) + (sec * 1000) + ms;
it('should find the right boundary', () => {

  expect(msTillNearestMinute(toMs(3, 0, 0))).toEqual(0);
  // Round down
  expect(msTillNearestMinute(toMs(3, 30, -1))).toEqual(-29999);
  // Round up
  expect(msTillNearestMinute(toMs(3, 30, 0))).toEqual(30 * 1000);
  // a few random entries
  expect(msTillNearestMinute(toMs(3, 15, 23))).toEqual(-toMs(0, 15, 23));
  expect(msTillNearestMinute(toMs(3, 48, 968))).toEqual(toMs(1, -48, -968));
  expect(msTillNearestMinute(toMs(3, 0, 999))).toEqual(-999);
});

it('should wait till minute boundary', async () => {
  jest.setTimeout(60000);
  await waitTillBuffer();
  const now = new Date();
  const msPast = toMs(0, now.getSeconds(), now.getMilliseconds());
  // This should always be within 100ms
  expect(BufferMs - Math.abs(msPast)).toBeLessThan(50);
})
