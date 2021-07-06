import { Settings } from "luxon";
import { init as initlog, log } from '@thecointech/logging';
import { init as initdb } from '@thecointech/firestore';
import { initLatest } from '../internals/rates/latest';
import { update } from '../internals/rates/UpdateDb';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZoneName = "America/New_York";
  // Logging (todo: connect to logs aggregator)
  initlog('rates-service');
  // connect to DB
  if (process.env.RATES_SERVICE_ACCOUNT) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.RATES_SERVICE_ACCOUNT
  }
  await initdb({project: "rates-service"});

  // Assume development is dev:live
  if (process.env.NODE_ENV === 'development') {
    await seed();
  }

  // Once we are all ready to go, warm up our cache of latest data.
  await initLatest();
  // Ensure that we have valid rates
  await update();

  log.trace('Initialization complete')
}
