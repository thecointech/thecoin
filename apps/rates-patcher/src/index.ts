// Imports the Google Cloud client library
import {Datastore} from '@google-cloud/datastore';
import {NextOpenTimestamp} from '@the-coin/utilities/MarketStatus';

// import data1m from './data1m.json';
// import data5m from './data5m.json';
// import usdcad5m from './usdcad5m.json';
import { ExchangeRate, FXRate, CoinUpdateInterval, RateOffsetFromMarket, FinnhubData, FinnhubRates, FinnhubFxQuotes } from './types';
import Axios from 'axios';
import {finnhub_key} from './secret.json';

var config = {
    keyFilename: '/src/TheCoin/apps/rates-patcher/thecoincore-212314-6f71b16407ed.json'
  };

// Creates a client
const datastore = new Datastore(config);


function getCoinRate(ts: number, data1m: FinnhubData, data5m?: FinnhubData) : ExchangeRate {
    const minuteBoundary = (ts - RateOffsetFromMarket) / 1000;
    for (var i = 1; i < 6; i++) {
        // saerch back 1m at a time
        const periodStart = minuteBoundary - (i * 60);
        const idx = data1m.t.indexOf(periodStart);
        if (idx >= 0)
        {
            return {
                Buy: data1m.l[idx] / 1000,
                Sell: data1m.h[idx] / 1000,
                ValidFrom: ts,
                ValidUntil: ts + CoinUpdateInterval
            } 
        }
    
        if (data5m)
        {
            // For earlier rates we can't use low/high
            const idx5 = data5m.t.indexOf(periodStart);
            if (idx5 >= 0)
            {
                return {
                    Buy: data5m.l[idx5] / 1000,
                    Sell: data5m.h[idx5] / 1000,
                    ValidFrom: ts,
                    ValidUntil: ts + CoinUpdateInterval
                } 
            }
        }
    }
    throw "Not Good:  " + ts;
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

async function getLatest<T>(ex: string, latestTs: number) : Promise<T>
{
    const k = datastore.key([ex, latestTs]);
    const [resp] = await (datastore.get(k)) as T[];
    console.log("Latest: " + JSON.stringify(resp))
    return resp;
}

async function setRate(kind: string, rate: ExchangeRate|FXRate) {
    const k = datastore.key([kind, rate.ValidUntil]);
    const r = await datastore.save({
        key: k,
        data: rate
    })
    console.log(r);

    await setLatest(kind, rate);
}

async function setLatest(kind: string, rate: ExchangeRate|FXRate) {
    const k = datastore.key([kind, "latest"]);
    const r = await datastore.save({
        key: k,
        data: rate
    })
    console.log(r);
}

async function fetchLatestCoin(resolution: string, from: number, to: number)
{
    const fromInt = Math.round(from / 1000);
    const toInt = Math.floor(to / 1000);
    console.log("Please let me through");
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=%5EGSPC&resolution=${resolution}&token=${finnhub_key}&from=${fromInt}&to=${toInt}`
    console.log("Throug Yaya");
    var r = await Axios.get<FinnhubData>(url);
    return r.data
}

async function fetchLatestFxRate()
{
    var r = await Axios.get<FinnhubRates>(`https://finnhub.io/api/v1/forex/rates?token=${finnhub_key}`);
    
    const {data} = r;
    const USD = data.quote["USD"];
    // Map to USD
    Object.entries(data.quote).forEach(kv => {
        const key = kv[0] as keyof FinnhubFxQuotes;
        data.quote[key] =data.quote[key] / USD;
    })
    return data
}

async function fetchLastWorkingTS() : Promise<number>
{
    const k = datastore.key([0, "latest"]);
    const [data] = await datastore.get(k)
    console.log("Updating from: " + new Date(data.ValidUntil));
    return data.ValidUntil;
}

async function quickstart() {

    console.log("Starting");
    const latestTs = await fetchLastWorkingTS();
    let now = Date.now();

    if (latestTs > now)
    {
        console.log("Nothing to do: sleeping");
        return;
    }

    const new1m = await fetchLatestCoin("1", latestTs - (90 * 1000), now);
    //const new5m = await fetchLatestCoin("5");
    const newFxRate = await fetchLatestFxRate();

    const latestCoin = await getLatest<ExchangeRate>("0", latestTs);
    const latestCad = await getLatest<FXRate>("124", latestTs);

    const latestBuy = latestCoin.Buy * latestCad.Rate;
    const latestSell = latestCoin.Sell * latestCad.Rate;

    let validUntil = latestCoin.ValidUntil;
    while (validUntil < now)
    {
        const coinRate = getCoinRate(validUntil, new1m);
        const fxRate = newFxRate.quote.CAD; // getFxRate(validUntil);
    
        const buy = coinRate.Buy * fxRate;
        const sell = coinRate.Sell * fxRate;
    
        console.log(`old: ${latestBuy} new: ${buy}`);
        console.log(`old: ${latestSell} new: ${sell}`);
    
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
        console.log(`NextValid: ${new Date(validUntil)} -> ${new Date(nextOpen)}`);
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
}
quickstart();