import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

// Imports the Google Cloud client library
import { Datastore } from '@google-cloud/datastore';
import { nextOpenTimestamp } from '@thecointech/market-status';
import { DateTime } from 'luxon';
import { ExchangeRate, FXRate, CoinUpdateInterval, RateOffsetFromMarket, FinnhubData, FinnhubRates, FinnhubFxQuotes } from './types';
import Axios from 'axios';
import { log } from './logging';
import fs from 'fs';
import { exit } from 'process';

const finnhub_key = process.env.FINNHUB_API_KEY;
if (!finnhub_key) {
  log.fatal('Missing FINNHUB_API_KEY variable');
  exit(1);
}

const keyFilename = process.env.GOOGLE_COINCORE_APP_CREDENTIALS;
if (!keyFilename) {
  log.fatal('Missing App Credentials');
  exit(1);
}

// Creates a client
const datastore = new Datastore({
  keyFilename
});


function getCoinRate(ts: number, data1m: FinnhubData, data5m?: FinnhubData): ExchangeRate {
  const minuteBoundary = (ts - RateOffsetFromMarket) / 1000;
  for (var i = 1; i < 6; i++) {
    // saerch back 1m at a time
    const periodStart = minuteBoundary - (i * 60);
    const idx = data1m.t.indexOf(periodStart);
    if (idx >= 0) {
      return {
        Buy: data1m.l[idx] / 1000,
        Sell: data1m.h[idx] / 1000,
        ValidFrom: ts,
        ValidUntil: ts + CoinUpdateInterval
      }
    }

    if (data5m) {
      // For earlier rates we can't use low/high
      const idx5 = data5m.t.indexOf(periodStart);
      if (idx5 >= 0) {
        return {
          Buy: data5m.l[idx5] / 1000,
          Sell: data5m.h[idx5] / 1000,
          ValidFrom: ts,
          ValidUntil: ts + CoinUpdateInterval
        }
      }
    }
    log.debug("Could not find entry for: " + periodStart);
  }

  const cnt = data1m.t?.length ?? 0;
  log.fatal(`Could not find coin rate for: ${ts}.  \nWe have ${data1m.t.length} rates, from ${new Date(data1m.t[0] * 1000)} => ${new Date(data1m.t[cnt - 1] * 1000)}`)
  throw new Error("RateNotFound");
}

async function setRate(kind: string, rate: ExchangeRate | FXRate) {
  const k = datastore.key([kind, rate.ValidUntil]);
  const r = await datastore.save({
    key: k,
    data: rate
  })
  log.trace(r);

  await setLatest(kind, rate);
}

async function setLatest(kind: string, rate: ExchangeRate | FXRate) {
  log.debug(`Setting latest for: ${kind}`);
  const k = datastore.key([kind, "latest"]);
  const r = await datastore.save({
    key: k,
    data: rate
  })
  log.trace(r);
}

async function fetchNewCoinRates(resolution: string, from: number, to: number) {
  log.trace(`Fetching SPX rates from ${new Date(from)} until now`);
  const fromInt = Math.round(from / 1000);
  const toInt = Math.floor(to / 1000);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=%5EGSPC&resolution=${resolution}&token=${finnhub_key}&from=${fromInt}&to=${toInt}`
  var r = await Axios.get<FinnhubData>(url);
  log.debug(`Fetched SPX rates: ${r?.statusText} - ${r?.data?.t?.length} results`);
  fs.writeFileSync(`./data${resolution}m.json`, JSON.stringify(r.data));
  return r.data
}

async function fetchNewFxRates() {
  log.trace("Fetching FX rates");
  var r = await Axios.get<FinnhubRates>(`https://finnhub.io/api/v1/forex/rates?token=${finnhub_key}`);
  log.debug(`Fetched FX rates: ${r?.statusText} - ${r?.data?.base} base`);
  const { data } = r;
  const USD = data.quote["USD"];
  // Map to USD
  Object.entries(data.quote).forEach(kv => {
    const key = kv[0] as keyof FinnhubFxQuotes;
    data.quote[key] = data.quote[key] / USD;
  })
  return data
}

async function fetchLastUpdateTS(): Promise<number> {
  const k = datastore.key([0, "latest"]);
  const [data] = await datastore.get(k)
  return data.ValidUntil;
}

async function update(count: number) : Promise<boolean> {

  log.debug(`--Begin Update ${count} --`);
  const latestTs = await fetchLastUpdateTS();
  log.debug("Current value valid until " + new Date(latestTs));
  let now = Date.now();

  if (latestTs > now) {
    log.debug(`Nothing to do: ${new Date(now)} < ${new Date(latestTs)}`);
    return true;
  }

  // we fetch from 3.5 mins prior to latest validity.
  // This is to ensure we include the candle starting 1.5 mins
  // before our last validity expired
  const fetchTimestamp = latestTs - 6.5 * (60 * 1000);
  const new1m = await fetchNewCoinRates("1", fetchTimestamp, now);
  const new5m = await fetchNewCoinRates("5", fetchTimestamp, now);
  const newFxRate = await fetchNewFxRates();

  let validUntil = latestTs;
  while (validUntil < now) {
    const coinRate = getCoinRate(validUntil, new1m, new5m);
    const fxRate = newFxRate.quote.CAD; // getFxRate(validUntil);

    const buy = coinRate.Buy * fxRate;
    const sell = coinRate.Sell * fxRate;

    log.trace(`New CAD buy rate: ${buy}`);
    log.trace(`New CAD sell rate: ${sell}`);

    validUntil = validUntil + CoinUpdateInterval
    const nextOpen = await nextOpenTimestamp(DateTime.fromMillis(validUntil), 90 * 1000)
    log.debug(`NextValid: ${new Date(validUntil)} -> ${new Date(nextOpen)}`);
    validUntil = nextOpen;
    coinRate.ValidUntil = nextOpen;
    //fxRate.ValidUntil = nextOpen;

    await setRate("0", coinRate);
    await setRate("124", {
      Rate: fxRate,
      ValidUntil: validUntil,
      ValidFrom: coinRate.ValidFrom
    });
  }
  return true;
}

async function tryUpdate()
{
  let ex: any = undefined;
  for (let i = 0; i < 10; i++) {
    try {
      const success = await update(i);
      if (success) {
        ex = undefined;
        break;
      }
    }
    catch (e) {
      ex = e;
      log.fatal(e);
    }
  }

  if (ex) throw ex;
}
tryUpdate();
