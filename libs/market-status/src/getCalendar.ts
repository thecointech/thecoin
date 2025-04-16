import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import axios from 'axios';
import type { Calendar, TradierResponse } from './types';
import { getSecret } from '@thecointech/secrets'
import {
  ExponentialBackoff,
  retry,
  handleAll,
} from 'cockatiel';


const ENDPOINT = 'https://sandbox.tradier.com/v1/markets/calendar';

// Cache accesses to reduce hits on the API
const _cache = new Map<string, Calendar>();

async function queryCalendar(url: string, signal?: AbortSignal) {
  const apiKey = await getSecret("TradierApiKey")
  const r = await axios.get<TradierResponse>(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json'
    },
    signal
  });
  if (r.status != 200) {
    throw new Error(`Calendar query failed with status: ${r.status}`);
  }
  return r.data;
}

export async function getCalendarRaw(date: DateTime, signal?: AbortSignal) {
  const uriArgs = `month=${date.month}&year=${date.year}`;
  const exists = _cache.get(uriArgs);
  if (exists)
    return exists;

  const data = await queryCalendar(`${ENDPOINT}?${uriArgs}`, signal);

  log.debug(
    {month: date.month, year: date.year, size: _cache.size},
    "Loaded Calendar for: {month}-{year} (size: {size} cached)"
  );
  const { calendar } = data;
  _cache.set(uriArgs, calendar);
  return calendar;
}

// Create a retry policy that'll try whatever function we execute 5
// times with a randomized exponential backoff.
const initialDelay = parseInt(process.env.CALENDAR_RETRY_DELAY || "2000");
const retryPolicy = retry(handleAll, { maxAttempts: 5, backoff: new ExponentialBackoff({ initialDelay }) });
retryPolicy.onRetry(res => log.warn(res, "Retry calendar fetch attempt {attempt} after {delay}ms"));
retryPolicy.onGiveUp(res => log.error(res, "Fetch calendar failed"));

export const getCalendar = async (date: DateTime) => retryPolicy.execute(ctx => getCalendarRaw(date, ctx.signal));
