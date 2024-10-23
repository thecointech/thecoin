import { jest } from '@jest/globals';
import { DateTime } from 'luxon';

// Override delay for testing
process.env.CALENDAR_RETRY_DELAY = '15';
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
  }
}));
jest.unstable_mockModule('@thecointech/logging', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}))
const { getCalendar } = await import('./getCalendar');
const { get } = (await import('axios') as jest.Mocked<typeof import('axios')>).default;
const { log } = await import('@thecointech/logging') as unknown as jest.Mocked<typeof import('@thecointech/logging')>;

beforeEach(() => {
  jest.resetAllMocks();
})

it ("it can return valid calendar", async () => {
  get.mockResolvedValue({ status: 200, data: { calendar: { month: 1, year: 2024 } }});
  const calendar = await getCalendar(DateTime.fromISO('2024-01-01'));
  expect(calendar.year).toBe(2024);
  expect(log.debug).toHaveBeenCalled();
  expect(log.error).not.toHaveBeenCalled();
  expect(log.warn).not.toHaveBeenCalled();
})

it("retries with success", async () => {
  get
    .mockRejectedValueOnce({ status: 500 })
    .mockRejectedValueOnce({ status: 500 })
    .mockRejectedValueOnce({ status: 500 })
    .mockResolvedValue({ status: 200, data: { calendar: { month: 1, year: 2024 } } });

  const calendar = await getCalendar(DateTime.fromISO('2024-02-01'));
  expect(calendar.year).toBe(2024);
  expect(log.debug).toHaveBeenCalled();
  expect(log.warn).toHaveBeenCalledTimes(3);
  expect(log.error).not.toHaveBeenCalled();
})

it("throws when retry expires", async () => {
  get.mockRejectedValue(new Error("network or something error"));
  await expect(getCalendar(DateTime.fromISO('2024-03-01'))).rejects.toThrow();
  expect(log.warn).toHaveBeenCalledTimes(5);
  expect(log.error).toHaveBeenCalledTimes(1);
  expect(log.debug).not.toHaveBeenCalled();
})
