import { default as axios, AxiosRequestConfig } from 'axios';
import { Dictionary } from 'lodash';
import {DateTime} from 'luxon';

const ENDPOINT = 'https://sandbox.tradier.com/v1/markets/calendar';

// TODO: Make sure we don't publish this in the website...
const AccessToken = 'iIAGXtPBcpae7eBS4wXgP8RRUlGT';

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
  }
}

// Cache accesses to reduce hits on the API
let CalendarCache: Dictionary<Calendar> = {};

async function GetCalendar(date: Date) {
  const uriArgs = `month=${date.getMonth() + 1}&year=${date.getFullYear()}`;
  const exists = CalendarCache[uriArgs];
  if (exists)
    return exists;

  const options: AxiosRequestConfig = {
    headers: {
      Authorization: AccessToken,
      Accept: 'application/json'
    }
  };
  const url = `${ENDPOINT}?${uriArgs}`


  const resp = await axios.get(url, options);
  if (resp.status != 200) {
    console.error(resp.statusText);
  }
  else {
    console.log("Loaded Calendar for: %i-%i, (%i cached)", date.getMonth()+1, date.getFullYear(), Object.keys(CalendarCache).length)
    const {calendar }= resp.data;
    CalendarCache[uriArgs] = calendar;
    return calendar as Calendar;
  }
  return null;
}

//////////////////////////////////////////////////////////////////////////
//  Returns timestamp of next time market will be open

function getAsTS(data: DayData, startEnd: "start"|"end") {
  const [year, month, day] = data.date.split("-");
  const [hour, minute] = data.open[startEnd].split(":")
  return DateTime.fromObject({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    zone: "America/New_York"
  }).toMillis();
}

function addDay(date: Date) {
  var nd = new Date(date.valueOf());
  nd.setDate(date.getDate() + 1);
  return nd;
}

// Returns either 0 for currently open, or timestamp of when it will be open
// If the market is not open on date, offset will be applied to allow us to
// move the time well into the market open period (as we can't get instant data)
// TODO: Support timezones
async function NextOpenTimestamp(date: Date, offset: number=120 * 1000) {

  // Only search 100 days.  If the market hasn't opened in
  // 100 days, then it's most likely due to the zombie apocalypse
  // and we are going to need to adjust our sales pitch to the
  // new market...
  const ts = date.getTime();
  for (let dt = date, i = 0; i < 100; dt = addDay(dt), i++) {
    const calendar = await GetCalendar(dt);
    if (calendar == null)
      continue;

    const { day } = calendar.days;
    let data = day[dt.getDate() - 1];
    if (data.open)
    {
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

export { GetCalendar, NextOpenTimestamp };
