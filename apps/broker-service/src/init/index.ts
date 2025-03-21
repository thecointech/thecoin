import { Settings } from "luxon";
import { init as initdb } from '@thecointech/firestore';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZone = "America/New_York";
  // connect to DB
  await initdb({ service: 'BrokerServiceAccount', project: "broker-cad" });

  if (process.env.NODE_ENV !== "production") {
    await seed();
  }
}