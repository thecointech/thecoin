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
    Coin: {
        Name: 'Coin',
        LatestKey: datastore.key(['Coin', 'Latest']),
        LatestRate: null
    },
    127: {
        Name: 'CAD',
        LatestKey: datastore.key([127, 'Latest']),
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
    let latest = await GetLatestExchangeRate('Coin');
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
    let validUntil = validFrom + CoinUpdateInterval;

    // If our validFrom is less than our latest valid until,
    // it means that the market has not yet updated.  In these
    // cases we simply take the last value and continue using it
    if (validFrom != latestValidUntil) {
        if (validFrom > latestValidUntil) {
            // We may have missed an update?  This should never actually happen, our
            // previous validity should always extend until the new data is valid
            console.error(`Mismatched intervals: previous Until: ${latestValidUntil}, current from: ${validFrom}`);
        }
        else {
            // This path occurs if the value we retrieve 
            // happens in the past - in this case we want
            // our new validity interval simply extend
            // past the last one
            validUntil = latestValidUntil + CoinUpdateInterval;
        }
        validFrom = latestValidUntil;
    }

    // Check to see that our validFrom is still in the future, and we have
    // enough time to update with the new values (2 seconds, cause why not)
    if (validFrom < (now + 2000)) {
        console.error("Update is happing too late, our previous validity expired at:" + (new Date(validFrom)));
        // We need to know this is happening, but cannot fix it in code (I think).
    }

    // If EOD, add enough time so the market is open again
    if (tzus(lastTime, "%-HH%MM", "America/New_York") == "15H59M") {
        // Last time is 3:59 pm.  Offset this time till market open tomorrow morning
        let tzValidUntil = tz(lastTime, "+1 day", "-6 hours", "-28 minutes");
        // Validate this is the correct time - valid until 30 seconds past our first data
        if (tzus(tzValidUntil, "%R:%S", "America/New_York") !== "09:31:00") {
            throw ("Got invalid market start time: " + tzus(tzValidUntil, "%F %R:%S", "America/New_York"));
        }
        // If it's a friday, skip the weekend
        if (tzus(tzValidUntil, "%w", "America/New_York") == 6)
            tzValidUntil = tz(tzValidUntil, "+2 days");

        // If we are still reading yesterdays data 15 mins into the new trading day,
        // assume the market must be closed and push the validUntil until tomorrow
        if ((new Date().getTime() - tzValidUntil) > 1000 * 60 * 15)
            tzValidUntil = tz(tzValidUntil, "+1 day");

        validUntil = tzValidUntil + RateOffsetFromMarket;

        // Last check: validUntil must be at least some distance in the future
        // This is an expected case in the first checks on a closed trading day
        // The prior algo will calculate a time at the start of the current day,
        // and will not skip todays values until 15 mins into the day.  For the first
        // calculations, we don't assume the market is closed, and so just delay
        // for the minimum time
        while (validUntil < (now + RateOffsetFromMarket))
            validUntil = validUntil + CoinUpdateInterval;

        console.log('Update Validity until: ' + tzus(validUntil, "%F %R:%S", "America/New_York"));
    }

    let lastEntry = data[lastkey];
    let low = parseFloat(lastEntry["3. low"]) / 1000;
    let high = parseFloat(lastEntry["2. high"]) / 1000;
    let newRecord = new ExchangeRate(low, high, validFrom, validUntil);

    InsertRate('Coin', newRecord.ValidUntil, newRecord);
    SetMostRecentRate('Coin', newRecord);
    latest = newRecord;
    return latest;
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

        let hours = tzus(now, "%H", "America/New_York");
        let minutes = tzus(now, "%M", "America/New_York");
        let seconds = tzus(now, "%S", "America/New_York");

        let lastBoundary = tz(now, `-${hours} hours`, `-${minutes} minutes`, `-${seconds} seconds`, "+31 minutes", "+30 seconds");
        let intervalTime = FXUpdateInterval;
        // Its possible we are updating before 00:31:30, in which case lastBoundary is in the future.
        // In this case we simply offset it backwards 
        if (lastBoundary > now)
            lastBoundary -= intervalTime;
        else {
            // Search forward in boundary points and keep the last
            // boundary that occured before now.
            let minBoundaryInterval = now + RateOffsetFromMarket;
            for (let t = lastBoundary; t <= minBoundaryInterval; t += intervalTime)
                lastBoundary = t;
        }

        // We reset validFrom to be now (as we can't
        // set a price in the past)
        validFrom = now;
        // and set this price to be valid until the next boundary
        validUntil = lastBoundary + FXUpdateInterval
    }
    latest = new FXRate(rate, validFrom, validUntil);
    InsertRate(currencyCode, validUntil, latest);
    SetMostRecentRate(currencyCode, latest);
    return latest
}


module.exports = {
    UpdateRates: function () {
        let now = new Date().getTime();

        return new Promise(async (resolve, reject) => {
            try {

                let waitCoin = EnsureLatestCoinRate(now);

                let currencyWaits = Object.keys(Exchanges).reduce((accum, value, index) => {
                    if (value != "Coin")
                        accum.push(EnsureLatestFXRate(value, now));
                    return accum;
                }, []);

                let latestCoin = await waitCoin;
                for (let i = 0; i < currencyWaits.length; i++) {
                    let latestFX = await currencyWaits[i];
                    if (latestFX.ValidUntil < now) {
                        console.error("Invalid timestamp: " + latestFX.ValidUntil);
                        resolve(false);
                        return;
                    }
                }
                if (latestCoin != null && latestCoin.ValidUntil > now)
                    resolve(latestCoin.ValidUntil);
                else
                    resolve(false);
            }
            catch (err) {
                console.error(err);
                reject("Update failed");
            }
        });
    },

    GetLatestRateFor: function (currencyCode) {
        //GetLatestCoinRate
    },

    GetRatesFor: function (currencyCode, timestamp) {

        return new Promise((resolve, reject) => {
            let query = datastore
                .createQuery(currencyCode)
                .filter('__key__', '>', datastore.key([currencyCode, timestamp]))
                .order('__key__')
                .limit(10)

            datastore.runQuery(query, function (err, entities) {
                if (err == null) {
                    if (entities.length == 0)
                        reject("No value registered for: " + currencyCode + " at: " + (new Date(timestamp)))
                    else {
                        // entities = An array of records.
                        // Access the Key object for an entity.
                        const rates = entities[0];
                        if (rates.ValidFrom > timestamp || rates.ValidUntil <= timestamp) {
                            reject("Returned rates " + JSON.stringify(rates) + " did not match match timestamp: " + timestamp);
                            return;
                        }
                        resolve(rates)
                    }
                }
                else {
                    reject(err);
                }
            });
        })
    }
}