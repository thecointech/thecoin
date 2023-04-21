import { Settings } from "luxon";
import { init as initdb } from '@thecointech/firestore';
import { seed } from "./seed";

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZone = "America/New_York";
  // connect to DB
  if (process.env.BROKER_SERVICE_ACCOUNT) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
  }
  await initdb({ project: "broker-cad" });

  if (process.env.NODE_ENV !== "production") {
    await seed();
  }
}
