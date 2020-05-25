// Imports the Google Cloud client library
import { Datastore } from '@google-cloud/datastore';
import { NextOpenTimestamp } from '@the-coin/utilities/MarketStatus';

// import data1m from './data1m.json';
// import data5m from './data5m.json';
// import usdcad5m from './usdcad5m.json';
import { ExchangeRate, FXRate, CoinUpdateInterval, RateOffsetFromMarket, FinnhubData, FinnhubRates, FinnhubFxQuotes } from './types';
import Axios from 'axios';
import { finnhub_key } from './secret.json';
import { log } from './logging';
import fs from 'fs';

var config = {
  keyFilename: '/src/TheCoin/apps/rates-patcher/thecoincore-212314-6f71b16407ed.json'
};

// Creates a client
const datastore = new Datastore(config);


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

// function getFxRate(ts: number) : FXRate {
//     const minuteBoundary = (ts - RateOffsetFromMarket) / 1000;
//     for (var i = 0; i < 6; i++) {
//         const periodStart = minuteBoundary - (i * 60);
//         const idx5 = usdcad5m.t.indexOf(periodStart);
//         if (idx5 >= 0)
//         {
//             return {
//                 Rate: usdcad5m.o[idx5],
//                 ValidFrom: ts,
//                 ValidUntil: ts + CoinUpdateInterval
//             }
//         }
//     }
//     throw "Not Possible:  " + ts;
// }

// async function getLatest<T>(ex: string, latestTs: number) : Promise<T>
// {
//     const k = datastore.key([ex, latestTs]);
//     const [resp] = await (datastore.get(k)) as T[];
//     log.trace("Latest: " + JSON.stringify(resp))
//     return resp;
// }

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

  //const latestCoin = await getLatest<ExchangeRate>("0", latestTs);
  //const latestCad = await getLatest<FXRate>("124", latestTs);

  //const latestBuy = latestCoin.Buy * latestCad.Rate;
  //const latestSell = latestCoin.Sell * latestCad.Rate;

  let validUntil = latestTs;
  while (validUntil < now) {
    const coinRate = getCoinRate(validUntil, new1m, new5m);
    const fxRate = newFxRate.quote.CAD; // getFxRate(validUntil);

    const buy = coinRate.Buy * fxRate;
    const sell = coinRate.Sell * fxRate;

    log.trace(`New CAD buy rate: ${buy}`);
    log.trace(`New CAD sell rate: ${sell}`);

    // We modify the coin rate to always be the best version
    // compared to the old buy/sell
    // if (latestBuy > buy)
    // {
    //     coinRate.Buy = latestBuy / fxRate;
    // }
    // if (latestSell < sell)
    // {
    //     coinRate.Sell = latestSell / fxRate;
    // }

    validUntil = validUntil + CoinUpdateInterval
    const nextOpen = await NextOpenTimestamp(new Date(validUntil), 90 * 1000)
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
