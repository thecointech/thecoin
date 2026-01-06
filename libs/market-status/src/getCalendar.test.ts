import { jest } from '@jest/globals';
import { DateTime } from 'luxon';
import { mockError, mockDebug, mockWarn } from '@thecointech/logging/mock';
// Override delay for testing
process.env.CALENDAR_RETRY_DELAY = '15';
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
  }
}));

const { getCalendar } = await import('./getCalendar');
const { get } = (await import('axios') as jest.Mocked<typeof import('axios')>).default;

beforeEach(() => {
  jest.resetAllMocks();
})

it ("it can return valid calendar", async () => {
  get.mockResolvedValue({ status: 200, data: { calendar: { month: 1, year: 2024 } }});
  const calendar = await getCalendar(DateTime.fromISO('2024-01-01'));
  expect(calendar.year).toBe(2024);
  expect(mockDebug).toHaveBeenCalled();
  expect(mockError).not.toHaveBeenCalled();
  expect(mockWarn).not.toHaveBeenCalled();
})

it("retries with success", async () => {
  get
    .mockRejectedValueOnce({ status: 500 })
    .mockRejectedValueOnce({ status: 500 })
    .mockRejectedValueOnce({ status: 500 })
    .mockResolvedValue({ status: 200, data: { calendar: { month: 1, year: 2024 } } });

  const calendar = await getCalendar(DateTime.fromISO('2024-02-01'));
  expect(calendar.year).toBe(2024);
  expect(mockDebug).toHaveBeenCalled();
  expect(mockWarn).toHaveBeenCalledTimes(3);
  expect(mockError).not.toHaveBeenCalled();
})

it("throws when retry expires", async () => {
  get.mockRejectedValue(new Error("network or something error"));
  await expect(getCalendar(DateTime.fromISO('2024-03-01'))).rejects.toThrow();
  expect(mockWarn).toHaveBeenCalledTimes(5);
  expect(mockError).toHaveBeenCalledTimes(1);
  expect(mockDebug).not.toHaveBeenCalled();
})
