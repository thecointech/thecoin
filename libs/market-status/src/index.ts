import { DateTime } from 'luxon';
import type { DayData } from './types';
import { getCalendar } from './getCalendar';

const MarketTZ = "America/New_York";

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

