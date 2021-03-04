import { Settings } from "luxon";
import { init as initlog} from '@the-coin/logging';
import { init as initdb } from '@the-coin/utilities/firestore';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZoneName = "America/New_York";
  // Logging (todo: connect to logs aggregator)
  initlog("broker-cad");
  // connect to DB
  await initdb({project: "broker-cad"});

  if (process.env.NODE_ENV !== "production") {
    if (process.env.SETTINGS === "live") {
      await seed();
    }
  }
  // // Assume development is dev:live
  // if (process.env.NODE_ENV === 'development') {
  //   // Seed our DB for a year, values set for a day.
  //   const from = DateTime
  //     .local()
  //     .minus({years: 1.1})
  //     .set({
  //       hour: 9,
  //       minute: 31,
  //       second: 30,
  //       millisecond: 0
  //     });

  //   const validityInterval = Duration.fromObject({days: 1});
  //   SeedWithRandomRates(from, validityInterval)
  //}
}
