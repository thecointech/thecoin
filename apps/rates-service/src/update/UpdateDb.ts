// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine

import fetch from "node-fetch";
import { ApiKey }  from './ApiKey';
//var { Datastore } = require('@google-cloud/datastore');
import { GetFirestore } from "@the-coin/utilities/Firestore";

//import { ArrayRenderer } from '../../../site/app/containers/HelpDocs/Renderer/ArrayRenderer';
//import { number } from 'card-validator';

var tz = require('timezone/loaded');
const tzus = tz(require("timezone/America"));

// Rates come into effect 30 seconds afeter the market rate.
// This to allow us time to update, and give brokers plenty of time
// to update their local caches before the new rate comes
// into effect.
const RateOffsetFromMarket = 30 * 1000
// How often to update the coin exchange rate/minimum interval
// a rate is valid for.  For testing period, we set this
// to a loooong time (3hrs), in production this should be
// set to 1 minute (shortest possible interval)
const CoinUpdateInterval = 60 * 60 * 3 * 1000;
const FXUpdateInterval = CoinUpdateInterval;

export class ExchangeRate {
    Buy: number;
    Sell: number;
    ValidFrom: number;
    ValidUntil: number;
    constructor(buy: number, sell: number, from: number, until: number) {
        this.Buy = buy;
        this.Sell = sell;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

export class FXRate {
    Rate: number;
    ValidFrom: number;
    ValidUntil: number;
    constructor(rate: number, from: number, until: number) {
        this.Rate = rate;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

class ExchangeObj {
    Name: string; 
    LatestKey: number; 
    LatestRate: number; 
    constructor(name: string, latestKey: number, latestRate: number){
        this.Name = name;
        this.LatestKey = latestKey;
        this.LatestRate = latestRate;
    }
}

export let Exchanges : ExchangeObj[] = [];

const getCollectionRates = (type: number) => 
    GetFirestore().collection("rates/"+type);

export async function getRates(type: number){
  let now = new Date().getTime();
  const collection = getCollectionRates(type);
  const snapshot = await collection
                        .where('validUntil', '>=', now)
                        .orderBy('validUntil', "desc")
                        .limit(1)
                        .get();
  return !snapshot.empty ? 
     collection.doc(snapshot.docs[0].id) : 
     collection.doc(); // new empty document
}


async function initialize(){
    //
    // All the supported exchanges
    // The CAD Rates
    (await getRates(0)).get().then(function(doc) {
        if (doc.exists) {
            let Exchange0 = new ExchangeObj('Coin', doc.get("Buy"), 0);
            Exchanges.splice(0, 0, Exchange0)
        } else {
            // doc.data() will be undefined in this case
            console.log("No such Rate!");
        }
    }).catch(function(error) {
        console.log("Error getting rate:", error);
    });

    // The Coin Rates
    (await getRates(124)).get().then(function(doc) {
        if (doc.exists) {
            let Exchange124 = new ExchangeObj('CAD', doc.get("Buy"), 0);
            Exchanges.splice(124, 0, Exchange124)
        } else {
            // doc.data() will be undefined in this case
            console.log("No such Rate");
        }
    }).catch(function(error) {
        console.log("Error getting rate:", error);
    });
}

initialize();


//
//  Returns the latest stored rate, or null if none present
//
export function GetLatestExchangeRate(code: number):Promise<any> {
    return new Promise(async (resolve, reject) => {
        let exchange = Exchanges[<number>code];
        if (exchange == null) {
            reject("Unsupported Currency");
            return;
        }
        if (exchange.LatestRate != null) {
            resolve(exchange.LatestRate);
            return;
        }

        // if we have no cached value, read from DB
        let datas = await getRates(exchange.LatestKey);
        let collection = (await datas.get());
        
        if ((await datas.get()).exists) {
            var latestRate = new ExchangeRate(collection.get("Buy"), collection.get("Sell"), collection.get("ValidFrom"), collection.get("ValidUntil"));
            exchange.LatestRate = latestRate.Buy;
            resolve(exchange.LatestRate);
        }
        // no error, we just don't have a latest value
        else resolve(null);
        
    });
}

export async function SetMostRecentRate(code: number, newRecord: ExchangeRate) {
    Exchanges[code].LatestRate = newRecord.Buy;
    let rateToInsert = {
        key: Exchanges[code].LatestKey,
        data: newRecord
    }
    return (await getRates(code)).set(rateToInsert, {merge: false});
}

export async function InsertRate(code: number, newRecord: ExchangeRate) {
    let rateToInsert = {
        data: newRecord
    }
    return (await getRates(code)).set(rateToInsert, {merge: false});

}

//////////////////////////////////////////////////////////////////////////

//
// Gets current rates, and if necessary, generates
// and stores a new rate.  This function may update
// the existing rate if it decides that the current
// rate is still valid (ie - if it decides the market is closed)
//
export async function EnsureLatestCoinRate(now: number) {
    let latest = await GetLatestExchangeRate(0);
    const validUntil = latest ? latest.ValidUntil : 0;

    // Quick exit if we are updating again too quickly
    // We should only update in the period between
    // when the new market values become available
    // and when they become our new rates.
    if ((validUntil - now) > RateOffsetFromMarket)
        return latest;

    return await UpdateLatestCoinRate(now, validUntil);
}

export async function UpdateLatestCoinRate(now: number, latestValidUntil: any) {
    var latest;
    let newRecord = await GetLatestCoinRate(now, latestValidUntil);
    if (newRecord){
        InsertRate(0, newRecord);
        SetMostRecentRate(0, newRecord);
        latest = newRecord;
    }
    return latest;
}

export async function GetLatestCoinRate(now: number, latestValidUntil: number) {
        // So we are legitimately updating.  Fetch
    // the latest records.
    var data = await QueryCoinRates();

    // Shift now back to the most recent price change boundary
    if (data == null) {
        // Fetch failed (upstream error?)
        // We can't do much about this, but we should
        // update current latest rate with new ending time.
        // TODO!
        console.error('Could not fetch Coin rates!');
        return null;
    }

    // We can only use the last item in the list,
    // as we can only set the price for this moment
    // forward (we can't change prices that happened
    // in the past)
    let keys = Object.keys(data);
    // NOTE!!!  This code runs in the assumption that
    // the keys are ordered (not guaranteed by spec)
    // This could theoretically break, but the perf
    // bonus of not sorting 100 strings is worth the risk
    // (there is code later verifying that this value is rational)
    const lastkey = keys[0];
    const lastTime = Date.parse(lastkey + ' EDT');
    console.log("Updating for time: " + tzus(lastTime, "%F %R:%S", "America/New_York") + " at time: " + new Date().toString());

    // Get the time this entry would be valid from
    let validFrom = (lastTime + (60 * 1000)) + RateOffsetFromMarket;
    let validUntil = FixCoinValidUntil(lastTime, now); //validFrom + CoinUpdateInterval;

    // If our validFrom is less than our latest valid until,
    // it means that the market has not yet updated.  In these
    // cases we simply take the last value and continue using it
    if (validFrom != latestValidUntil) {
        if (validFrom > latestValidUntil) {
            // We may have missed an update?  This should never actually happen, our
            // previous validity should always extend until the new data is valid
            console.error(`Mismatched intervals: previous Until: ${latestValidUntil}, current from: ${validFrom}`);
        }
        // else {
        //     // This path occurs if the value we retrieve 
        //     // happens in the past - in this case we want
        //     // our new validity interval simply extend
        //     // past the last one
        //     validUntil = latestValidUntil + CoinUpdateInterval;
        // }
        validFrom = latestValidUntil;
    }

    // Check to see that our validFrom is still in the future, and we have
    // enough time to update with the new values (2 seconds, cause why not)
    if (validFrom < (now + 2000)) {
        console.error("Update is happing too late, our previous validity expired at:" + (new Date(validFrom)));
        // We need to know this is happening, but cannot fix it in code (I think).
    }

    //validUntil = FixCoinValidUntil(validUntil, lastTime, now);

    let lastEntry = data[lastkey];
    let low = parseFloat(lastEntry["3. low"]) / 1000;
    let high = parseFloat(lastEntry["2. high"]) / 1000;
    return new ExchangeRate(low, high, validFrom, validUntil);
}

export function FixCoinValidUntil(lastTime: number, now: number) {
    let fixedUntil = now
    // If EOD, add enough time so the market is open again
    if (tzus(lastTime, "%-HH%MM", "America/New_York") == "16H00M") {
        // Last time is 4:00 pm.  Offset this time till market open tomorrow morning
        let tzValidUntil = tz(lastTime, "+1 day", "-6 hours", "-29 minutes");
        // Validate this is the correct time - valid until 30 seconds past our first data
        if (tzus(tzValidUntil, "%R:%S", "America/New_York") !== "09:31:00") {
            throw ("Got invalid market start time: " + tzus(tzValidUntil, "%F %R:%S", "America/New_York"));
        }
        // If it's a friday, skip the weekend
        if (tzus(tzValidUntil, "%w", "America/New_York") == 6)
            tzValidUntil = tz(tzValidUntil, "+2 days");

        // If we are still reading yesterdays data 15 mins into the new trading day,
        // assume the market must be closed and push the validUntil until tomorrow
        if ((now - tzValidUntil) > 1000 * 60 * 15)
            tzValidUntil = tz(tzValidUntil, "+1 day");

        fixedUntil = tzValidUntil + RateOffsetFromMarket;

        // Last check: validUntil must be at least some distance in the future
        // This is an expected case in the first checks on a closed trading day
        // The prior algo will calculate a time at the start of the current day,
        // and will not skip todays values until 15 mins into the day.  For the first
        // calculations, we don't assume the market is closed, and so just delay
        // for the minimum time
        while (fixedUntil < (now + RateOffsetFromMarket))
            fixedUntil = fixedUntil + CoinUpdateInterval;

    }
    else {
        fixedUntil = AlignToNextBoundary(now, CoinUpdateInterval);
    }
    console.log('Update Validity until: ' + tzus(fixedUntil, "%F %R:%S", "America/New_York"));
    return fixedUntil
}

export async function QueryExchange(args: string) {
    var avURL = 'https://www.alphavantage.co/query?function=' + args + '&apikey=' + ApiKey.AlphaVantage;
    try {
        const response = await fetch(avURL);
        const json = await response.json();
        console.log('Recieved update@ ', new Date());
        return json;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function QueryCoinRates() {
    var forexJs = await QueryExchange("TIME_SERIES_INTRADAY&symbol=SPX&interval=1min");
    var dataJs = forexJs["Time Series (1min)"];
    return dataJs;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

export function AlignToNextBoundary(timestamp: number, updateInterval: number)
{
    let hours = tzus(timestamp, "%H", "America/New_York");
    let minutes = tzus(timestamp, "%M", "America/New_York");
    let seconds = tzus(timestamp, "%S", "America/New_York");
    // TODO: Is this a safe assumption?
    let ms = timestamp % 1000; 

    // We simply discard ms
    timestamp -= ms;

    // TODO: un-hard-coded start time
    // Set to the start of the (NY) day
    let lastBoundary = tz(timestamp, `-${hours} hours`, `-${minutes} minutes`, `-${seconds} seconds`, "+31 minutes", "+30 seconds");

    // Its possible we are updating before 00:31:30, in which case lastBoundary is in the future.
    // In this case we simply offset it backwards 
    if (lastBoundary > timestamp)
        lastBoundary -= updateInterval;
    else {
        // Search forward in boundary points and keep the last
        // boundary that occured before timestamp.
        let minBoundaryInterval = timestamp + RateOffsetFromMarket;
        for (let t = lastBoundary; t <= minBoundaryInterval; t += updateInterval)
            lastBoundary = t;
    }


    // and set this price to be valid until the next boundary
    return lastBoundary + updateInterval
}


//////////////////////////////////////////////////////////////////////////////////////////////////////

export async function QueryForexRate(currencyCode: number) {
    const ticker = Exchanges[currencyCode].Name;
    var forexJs = await QueryExchange("CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=" + ticker);
    return forexJs["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
}

export async function EnsureLatestFXRate(currencyCode: number, now:number) {
    let latest = await GetLatestExchangeRate(currencyCode);
    var validFrom = <any>0;
    var validUntil = <any>0;
    var lastUntil = <any>0;
    // Only update FX every 5 minutes (it doesn't change that fast).
    if (latest && latest instanceof ExchangeRate){
        lastUntil = latest ? latest.ValidUntil : 0;
        lastUntil = lastUntil;
        if (lastUntil && (<any>lastUntil - <any>now) > RateOffsetFromMarket)
            return latest;

        // Assume that last interval is still valid (normal operatino)
        let validFrom = lastUntil;
        // If the value is out of sync, reset the validUntil 
        // to be correct again.
        if (validFrom < now) {
            // This can happen on first runs, and possibly if
            // we've had issues and failed a prior update
            // If our last interval expired prematurely, there isn't much we can do
            // However, we want to ensure that our valid until is set to about FXUpdateInterval
            // in the future, as we assume thats the next time we update. 


        }
    }            
    // We reset validFrom to be timestamp (as we can't
    // set a price in the past)
    validFrom = now;
    validUntil = AlignToNextBoundary(now, FXUpdateInterval)

    // Update with the latest USD/CAD forex
    // Unlike stocks, this is a point-in-time,
    // not OHLC, so we just take whatever value
    // we get as the rate for the next interval
    let rate = await QueryForexRate(currencyCode);
    rate = Number.parseFloat(rate);


    latest = new FXRate(rate, validFrom, validUntil);
    InsertRate(currencyCode, latest);
    SetMostRecentRate(currencyCode, latest);
    return latest
}

export function EnsureLatestRate(code: number, timestamp:number) 
{
    if (code == 0)
        return EnsureLatestCoinRate(timestamp);
    return EnsureLatestFXRate(code, timestamp);
}

export async function DoUpdates(now: number) {
    try {
        let currencyWaits = Object.keys(Exchanges).reduce((accum: Object[], value: any) => {
            //const accum = [] as any;
            accum.push(EnsureLatestRate(value, now));
            return accum;
        }, []);

        let validUntil = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < currencyWaits.length; i++) {
            let latestFX = await currencyWaits[i];
            if (latestFX  instanceof ExchangeRate){
                if (latestFX.ValidUntil < now) {
                    console.error("Invalid timestamp: " + latestFX.ValidUntil);
                    return false;
                }
                if (validUntil > latestFX.ValidUntil){

                }
                validUntil = Math.min(validUntil, latestFX.ValidUntil);
            }
        }
        return validUntil;
    }
    catch (err) {
        console.error(err);
    }
    return false;
}

export function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function GetMsTillSecsPast(seconds: number, nowDate: Date) {
    let nowMs = nowDate.getMilliseconds() + nowDate.getSeconds() * 1000;
    return Math.max((seconds * 1000) - nowMs, 0);
}

export function ForceLatestRate(resolve: { (value?: unknown): void; (value?: unknown): void; (arg0: any): void; }, reject: { (reason?: any): void; (reason?: any): void; (arg0: string | undefined): void; }, code: number, timestamp: number)
{
    EnsureLatestRate(code, timestamp)
    .then((rates: ExchangeRate) => {
        if (rates.ValidUntil > timestamp)
            resolve(rates)
        else 
            reject();
    })
    .catch((err: any) => {
        console.error(err);
        reject("Could not retrieve rates");
    })
}

export function UpdateRates() {
    return new Promise(async (resolve, reject) => {
        // Wait at until at least 2 seconds past the mark
        // to ensure that our data provider is ready with
        // the latest deets.
        let pauseMs = GetMsTillSecsPast(2, new Date());
        await Sleep(pauseMs);
        let now = new Date().getTime();
        const success = await DoUpdates(now);
        if (success)
            resolve(success);
        else
            reject("Update Failed");
    });
}

 export function GetLatestRateFor() {
    //GetLatestCoinRate
}

export function GetRatesFor(currencyCode: number, timestamp: number) {
    console.log("getting rates for %d at %s", currencyCode, timestamp);
    return  new Promise(async (resolve, reject) => {
        // Double check this is not for the future
        let now = new Date().getTime() + RateOffsetFromMarket;
        if (timestamp > now)
        {
            console.error("Request for future rates (%s) rejected", tzus(timestamp, "%F %R:%S", "America/New_York"));
            reject("Could not retrieve rates 1");
            return;
        }

        let datas = await getRates(currencyCode);
        let collection = (await datas.get());
        if (!(await datas.get()).exists){
            reject("Could not retrieve rates 2");
        } 
        else if (datas.collection.length == 0){
            console.warn("No currency retrieved for %d at %s, attempting update", currencyCode, tzus(timestamp, "%F %R:%S", "America/New_York"));
            ForceLatestRate(resolve, reject, currencyCode, timestamp);
        }
        else if (collection.get("ValidUntil") < timestamp){
            console.warn("Forced update at %s, previous interval expired at %s", tzus(timestamp, "%F %R:%S", "America/New_York"), tzus(collection.get("ValidUntil") , "%F %R:%S", "America/New_York"));
            ForceLatestRate(resolve, reject, currencyCode, timestamp);
        }
        else if (collection.get("ValidUntil") > timestamp){
            console.error("Queried rates are not yet valid: %s < %s", tzus(timestamp, "%F %R:%S", "America/New_York"), tzus(collection.get("ValidFrom") , "%F %R:%S", "America/New_York"));
            reject("Could not retrieve rates 3");
        }
        else {
            resolve(collection);
        }
        
    })
}

//if (process.env.NODE_ENV === 'test') {
//    module.exports.GetMsTillSecsPast = GetMsTillSecsPast;
//    module.exports.FixCoinValidUntil = FixCoinValidUntil;
//    module.exports.GetLatestCoinRate = GetLatestCoinRate;
//    module.exports.AlignToNextBoundary = AlignToNextBoundary;
//    module.exports.FXUpdateInterval = FXUpdateInterval;
//    module.exports.CoinUpdateInterval = CoinUpdateInterval;
//}