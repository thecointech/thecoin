import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import axios from 'axios';

const ENDPOINT = 'https://sandbox.tradier.com/v1/markets/calendar';
const MarketTZ = "America/New_York";

type DayData = {
  open: {
    start: string,
    end: string,
  }
  date: string
}
type Calendar = {
  days: {
    day: DayData[];
  },
  month: number,
  year: number,
}
type TradierResponse = {
  calendar: Calendar
}

// Cache accesses to reduce hits on the API
const _cache = new Map<string, Calendar>();

async function queryCalendar(url: string) {
  try {
    const r = await axios.get<TradierResponse>(url, {
      headers: {
        Authorization: process.env.TRADIER_API_KEY!,
        Accept: 'application/json'
      }
    });
    if (r.status == 200) {
      return r.data;
    }
    log.error(r.statusText);
  } catch (err: any) {
    log.error(err, `Calendar query failed`);
  }
  return null;
}


export async function getCalendar(date: DateTime) {
  const uriArgs = `month=${date.month}&year=${date.year}`;
  const exists = _cache.get(uriArgs);
  if (exists)
    return exists;

  const data = await queryCalendar(`${ENDPOINT}?${uriArgs}`);

  if (data) {
    log.trace(`Loaded Calendar for: ${date.month}-${date.year}, (${_cache.size} cached)`);
    const { calendar } = data;
    _cache.set(uriArgs, calendar);
    return calendar;
  }
  return null;
}

//////////////////////////////////////////////////////////////////////////
//  Returns timestamp of next time market will be open

function getAsTS(data: DayData, startEnd: "start" | "end") {
  const [year, month, day] = data.date.split("-");
  const [hour, minute] = data.open[startEnd].split(":")
  return DateTime.fromObject(
    {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: parseInt(minute),
    },
    { zone: MarketTZ }
  ).toMillis();
}

// Returns either 0 for currently open, or timestamp of when it will be open
// If the market is not open on date, offset will be applied to allow us to
// move the time well into the market open period (as we can't get instant data)
export async function nextOpenTimestamp(date: DateTime, offset: number = 120 * 1000) {

  // Only search 100 days.  If the market hasn't opened in
  // 100 days, then it's most likely due to the zombie apocalypse
  // and we are going to need to adjust our sales pitch to the
  // new market...
  const local = date.setZone(MarketTZ);
  const ts = local.toMillis();
  for (let dt = local, i = 0; i < 100; dt = dt.plus({ days: 1 }), i++) {
    const calendar = await getCalendar(dt);
    if (calendar == null)
      continue;

    const { day } = calendar.days;
    let data = day[dt.day - 1];
    if (data.open) {
      const ots = getAsTS(data, 'start')
      if (ots > ts)
        return offset ? offset + ots : ots;
      else {
        // This condition should only be true
        // on the first iteration, when start is
        // earlier than TS
        const cts = getAsTS(data, 'end')
        // We are before close
        if (ts < cts)
          return ts;
      }
    }
  }

  throw new Error("Could not find valid opening (check for zombies)");
}

