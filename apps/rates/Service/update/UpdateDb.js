// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const Datastore = require('@google-cloud/datastore');
const fetch = require("node-fetch");
const ApiKey = require('./ApiKey');
const tz = require('timezone/loaded');
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

class ExchangeRate {
    constructor(buy, sell, from, until) {
        this.Buy = buy;
        this.Sell = sell;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

class FXRate {
    constructor(rate, from, until) {
        this.Rate = rate;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

// Instantiate a datastore client
const datastore = Datastore({
    projectId: "thecoincore-212314"
});

//
// All the supported exchanges
//
let Exchanges = {
    0: {
        Name: 'Coin',
        LatestKey: datastore.key([0, 'Latest']),
        LatestRate: null
    },
    124: {
        Name: 'CAD',
        LatestKey: datastore.key([124, 'Latest']),
        LatestRate: null
    }
}

//
//  Returns the latest stored rate, or null if none present
//
function GetLatestExchangeRate(code) {
    return new Promise((resolve, reject) => {
        let exchange = Exchanges[code];
        if (exchange == null) {
            reject("Unsupported Currency");
            return;
        }
        if (exchange.LatestRate != null) {
            resolve(exchange.LatestRate);
            return;
        }

        // if we have no cached value, read from DB
        datastore.get(exchange.LatestKey, function (err, entity) {
            if (err == null) {
                exchange.LatestRate = entity;
                resolve(exchange.LatestRate);
            }
            // no error, we just don't have a latest value
            else resolve(null);
        });
    });
}

function SetMostRecentRate(code, newRecord) {
    Exchanges[code].LatestRate = newRecord;
    return datastore.save({
        key: Exchanges[code].LatestKey,
        data: newRecord
    });
}

function InsertRate(code, ts, newRecord) {
    let recordKey = datastore.key([code, ts]);
    return datastore.save({
        key: recordKey,
        data: newRecord
    });
}

//////////////////////////////////////////////////////////////////////////

//
// Gets current rates, and if necessary, generates
// and stores a new rate.  This function may update
// the existing rate if it decides that the current
// rate is still valid (ie - if it decides the market is closed)
//
async function EnsureLatestCoinRate(now) {
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

async function UpdateLatestCoinRate(now, latestValidUntil) {
    let newRecord = await GetLatestCoinRate(now, latestValidUntil);
    InsertRate(0, newRecord.ValidUntil, newRecord);
    SetMostRecentRate(0, newRecord);
    latest = newRecord;
    return latest;
}

async function GetLatestCoinRate(now, latestValidUntil) {
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

function FixCoinValidUntil(lastTime, now) {
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

async function QueryExchange(args) {
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

async function QueryCoinRates() {
    var forexJs = await QueryExchange("TIME_SERIES_INTRADAY&symbol=SPX&interval=1min");
    var dataJs = forexJs["Time Series (1min)"];
    return dataJs;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

function AlignToNextBoundary(timestamp, updateInterval)
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

async function QueryForexRate(currencyCode) {
    const ticker = Exchanges[currencyCode].Name;
    var forexJs = await QueryExchange("CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=" + ticker);
    return forexJs["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
}

async function EnsureLatestFXRate(currencyCode, now) {
    let latest = await GetLatestExchangeRate(currencyCode);
    // Only update FX every 5 minutes (it doesn't change that fast).
    const lastUntil = latest ? latest.ValidUntil : 0;
    if (lastUntil - now > RateOffsetFromMarket)
        return latest;

    // Update with the latest USD/CAD forex
    // Unlike stocks, this is a point-in-time,
    // not OHLC, so we just take whatever value
    // we get as the rate for the next interval
    let rate = await QueryForexRate(currencyCode);
    rate = Number.parseFloat(rate);

    // Assume that last interval is still valid (normal operatino)
    let validFrom = lastUntil;
    // NOTE: This Valid Until does not take into account time changes, so
    // may become out-of-sync during DST.  
    let validUntil = FXUpdateInterval + validFrom;
    // If the value is out of sync, reset the validUntil 
    // to be correct again.
    if (validFrom < now) {
        // This can happen on first runs, and possibly if
        // we've had issues and failed a prior update
        // If our last interval expired prematurely, there isn't much we can do
        // However, we want to ensure that our valid until is set to about FXUpdateInterval
        // in the future, as we assume thats the next time we update. 

        // We reset validFrom to be timestamp (as we can't
        // set a price in the past)
        validFrom = now;
        validUntil = AlignToNextBoundary(now, FXUpdateInterval)
    }
    latest = new FXRate(rate, validFrom, validUntil);
    InsertRate(currencyCode, validUntil, latest);
    SetMostRecentRate(currencyCode, latest);
    return latest
}

function EnsureLatestRate(code, timestamp) 
{
    if (code == 0)
        return EnsureLatestCoinRate(timestamp);
    return EnsureLatestFXRate(code, timestamp);
}

async function DoUpdates(now) {

    try {
        let currencyWaits = Object.keys(Exchanges).reduce((accum, value, index) => {
            accum.push(EnsureLatestRate(value, now));
            return accum;
        }, []);

        let validUntil = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < currencyWaits.length; i++) {
            let latestFX = await currencyWaits[i];
            if (latestFX.ValidUntil < now) {
                console.error("Invalid timestamp: " + latestFX.ValidUntil);
                return false;
            }
            validUntil = Math.min(validUntil, latestFX.ValidUntil);
        }
        return validUntil;
    }
    catch (err) {
        console.error(err);
    }
    return false;
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function GetMsTillSecsPast(seconds, nowDate) {
    let nowMs = nowDate.getMilliseconds() + nowDate.getSeconds() * 1000;
    return Math.max((seconds * 1000) - nowMs, 0);
}

function ForceLatestRate(resolve, reject, code, timestamp)
{
    EnsureLatestRate(code, timestamp)
    .then((rates) => {
        if (rates.ValidUntil > timestamp)
            resolve(rates)
        else 
            reject();
    })
    .catch((err) => {
        console.error(err);
        reject("Could not retrieve rates");
    })
}

module.exports = {
    UpdateRates: function () {
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
    },

    GetLatestRateFor: function (currencyCode) {
        //GetLatestCoinRate
    },

    GetRatesFor: function (currencyCode, timestamp) {
        console.log("getting rates for %d at %s", currencyCode, timestamp);
        return new Promise((resolve, reject) => {
            // Double check this is not for the future
            let now = new Date().getTime() + RateOffsetFromMarket;
            if (timestamp > now)
            {
                console.error("Request for future rates (%s) rejected", tzus(timestamp, "%F %R:%S", "America/New_York"));
                reject("Could not retrieve rates");
                return;
            }

            let query = datastore
                .createQuery(currencyCode)
                .filter('__key__', '>', datastore.key([currencyCode, timestamp]))
                .order('__key__')
                .limit(10)

            datastore.runQuery(query, function (err, entities) {
                if (err != null)
                {
                    console.error(err);
                    reject("Could not retrieve rates");
                }
                else if (entities.length == 0)
                {
                    console.warn("No currency retrieved for %d at %s, attempting update", currencyCode, tzus(timestamp, "%F %R:%S", "America/New_York"));
                    ForceLatestRate(resolve, reject, currencyCode, timestamp);
                }
                else if (entities[0].ValidUntil < timestamp)
                {
                    console.warn("Forced update at %s, previous interval expired at %s", tzus(timestamp, "%F %R:%S", "America/New_York"), tzus(entities[0].ValidUntil, "%F %R:%S", "America/New_York"));
                    ForceLatestRate(resolve, reject, currencyCode, timestamp);
                }
                else if (entities[0].ValidFrom > timestamp)
                {
                    console.error("Queried rates are not yet valid: %s < %s", tzus(timestamp, "%F %R:%S", "America/New_York"), tzus(entities[0].ValidFrom, "%F %R:%S", "America/New_York"));
                    reject("Could not retrieve rates");
                }
                else {
                    resolve(entities[0]);
                }
            });
        })
    }
}

if (process.env.NODE_ENV === 'test') {
    module.exports.GetMsTillSecsPast = GetMsTillSecsPast;
    module.exports.FixCoinValidUntil = FixCoinValidUntil;
    module.exports.GetLatestCoinRate = GetLatestCoinRate;
    module.exports.AlignToNextBoundary = AlignToNextBoundary;
    module.exports.FXUpdateInterval = FXUpdateInterval;
    module.exports.CoinUpdateInterval = CoinUpdateInterval;
}