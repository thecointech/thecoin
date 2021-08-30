import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

// Imports the Google Cloud client library
import { Datastore } from '@google-cloud/datastore';
import fs from 'fs';
import { exit } from 'process';
import { log, init } from '@the-coin/logging';

const keyFilename = process.env.GOOGLE_COINCORE_APP_CREDENTIALS;
if (!keyFilename) {
  log.fatal('Missing App Credentials');
  exit(1);
}

// Creates a client
const datastore = new Datastore({
  keyFilename
});

// const firstValidTill = 1540387890000;

async function getRates(kind: number) {
  const query = datastore.createQuery(kind.toString());
  const r = await datastore.runQuery(query);
  return r[0];
}

async function fetch() {
  init('rates-service-portsrc');

  log.debug("Fetching coin rates");
  const coin = await getRates(0);
  log.debug("fetching fx rates")
  const fxrates = await getRates(124);
  log.debug("Finished");
  const file = "/src/TheCoin/secrets/UserData/rates.cache"
  fs.writeFileSync(file, JSON.stringify({
    coin,
    fxrates,
  }))
  log.debug(`Wrote: ${file}`);
}

fetch();
