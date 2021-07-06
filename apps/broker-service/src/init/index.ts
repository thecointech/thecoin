import { Settings } from "luxon";
import { init as initlog } from '@thecointech/logging';
import { init as initdb } from '@thecointech/firestore';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZoneName = "America/New_York";
  // Logging (todo: connect to logs aggregator)
  initlog("broker-cad");
  // connect to DB
  await initdb({ project: "broker-cad" });

  if (process.env.NODE_ENV !== "production") {
    await seed();
  }
}
