import { Settings } from "luxon";
import { init as initdb } from '@thecointech/firestore';
import { seed } from "./seed";
import { init as initSecrets } from '@thecointech/secrets';

export async function init() {
  // Init luxon to use the right timezone
  Settings.defaultZone = "America/New_York";
  // connect to DB
  await initdb({ service: 'BrokerServiceAccount', project: "broker-cad" });

  if (process.env.NODE_ENV !== "production") {
    await seed();
  }

  // Init secrets
  if (!process.env.GAE_ENV) {
    process.env.GAE_LONG_APP_ID = process.env.GCLOUD_BROKER_SERVICE_NAME;
  }
  initSecrets('BrokerServiceAccount');
}