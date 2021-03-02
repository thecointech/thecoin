import { DateTime, Duration, Settings } from "luxon";
import { init as initlog} from '@the-coin/logging';
import { init as initdb } from '@the-coin/utilities/firestore';
import { initLatest } from '../internals/rates/latest';
import { SeedWithRandomRates } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZoneName = "America/New_York";
  // Logging (todo: connect to logs aggregator)
  initlog('rates-service');
  // connect to DB
  await initdb({project: "broker-cad"});

  // Assume development is dev:live
  if (process.env.NODE_ENV === 'development') {
    // Seed our DB for a year, values set for a day.
    const from = DateTime
      .local()
      .minus({years: 1.1})
      .set({
        hour: 9,
        minute: 31,
        second: 30,
        millisecond: 0
      });

    const validityInterval = Duration.fromObject({days: 1});
    SeedWithRandomRates(from, validityInterval)
  }

  // Once we are all ready to go, warm up our cache of latest data.
  await initLatest();
}
