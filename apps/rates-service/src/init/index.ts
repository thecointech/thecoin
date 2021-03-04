import { Settings } from "luxon";
import { init as initlog, log } from '@the-coin/logging';
import { init as initdb } from '@the-coin/utilities/firestore';
import { initLatest } from '../internals/rates/latest';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZoneName = "America/New_York";
  // Logging (todo: connect to logs aggregator)
  initlog('rates-service');
  // connect to DB
  await initdb({project: "rates-service"});

  // Assume development is dev:live
  if (process.env.NODE_ENV === 'development') {
    await seed();
  }

  // Once we are all ready to go, warm up our cache of latest data.
  await initLatest();

  log.trace('Initialization complete')
}
