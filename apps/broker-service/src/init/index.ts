import { Settings } from "luxon";
import { init as initdb } from '@thecointech/firestore';
import { seed } from "./seed";
import { init as initSecrets } from '@thecointech/secrets';
import type { Express } from 'express';
import { addMockBPEndpoint } from './mockBP';

export async function init(app: Express) {
  // Init luxon to use the right timezone
  Settings.defaultZone = "America/New_York";
  // connect to DB
  await initdb({ service: 'BrokerServiceAccount', project: "broker-cad" });

  if (process.env.NODE_ENV !== "production") {
    await seed();
  }

  if (process.env.CONFIG_NAME === 'devlive') {
    addMockBPEndpoint(app);
  }

  // Init secrets
  initSecrets('BrokerServiceAccount', process.env.GCLOUD_BROKER_SERVICE_NAME!);
}
