// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const Datastore = require('@google-cloud/datastore');
const fetch = require("node-fetch");
const ApiKey = require('./ApiKey');



// Timestamps are measured in tenths of a second
var CoinTimeHZ = 10;
// We want to pack into an Int32, so set zero date to quite recently
const ZeroTime = new Date(Date.UTC(2018, 6, 1)).getTime();

// Utility fns
function CoinTimeHrs(hrs) { return (hrs * 60 * 60 * CoinTimeHZ); }
function TimeToCT(time) { return Math.floor((time - ZeroTime) / (1000 / CoinTimeHZ)); }
function DateToCT(date) { return TimeToCT(date.getTime()); }
function GetNow() { return TimeToCT(Date.now()); }

function CTToDate(ct) {
    let d = new Date();
    d.setTime(ZeroTime + (ct * 1000 / CoinTimeHZ));
    return d;
}

// Rates come into effect 30 seconds afeter the market rate.
// This to allow us time to update, and give brokers plenty of time
// to update their local caches before the new rate comes
// into effect.
const RateOffsetFromMarket = 30 * CoinTimeHZ
// How often to update the coin exchange rate/minimum interval
// a rate is valid for.  For testing period, we set this
// to a loooong time (3hrs), in production this should be
// set to 1 minute (shortest possible interval)
const CoinUpdateInterval = 60 * 60 * 3 * CoinTimeHZ;

class ExchangeRate {
    constructor(buy, sell, from, until) {
        this.Buy = buy;
        this.Sell = sell;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

class FXRate {
    constructor(rate, timestamp) {
        this.Rate = rate;
        this.Timestamp = timestamp;
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
        return latest;
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
    const lastkey = keys[0]; //Math.max(...keys);
    const lastTime = Date.parse(lastkey + ' EDT');

    // Get the time this entry would be valid from
    const validFrom = TimeToCT(lastTime) + RateOffsetFromMarket;
    if (validFrom >= latestValidUntil) {

        // Get a Date object so we can compare things like hours & days
        let lastDate = new Date();
        // !!!IMPORTANT!!!  This only works if your server is in EST
        // Because mine is, I'm just going to leave it like this,
        // but future reviews should update this to work in any TZ
        lastDate.setTime(lastTime);

        // New entry, enter it into the database
        // Each entry is valid for 1 minute
        let newValidUntil = validFrom + CoinUpdateInterval;
        // If EOD, add enough time so the market is open again
        if (lastDate.getHours() == 16) {
            // Add 17.5 hours and 1 minute.  Should be 9:31:30
            newValidUntil = validFrom + (60 * CoinTimeHZ) + CoinTimeHrs(17.5);
            // VERIFY: We gotta check this vs leap years etc...
            let newValidUntilDate = CTToDate(newValidUntil);
            if (newValidUntilDate.getHours() != 9 || newValidUntilDate.getMinutes() != 31 || newValidUntilDate.getSeconds() != (RateOffsetFromMarket / CoinTimeHZ)) {
                throw new Exception("Got invalid market start time: " + newValidUntilDate.toString());
            }
            // If it's a friday, skip the weekend
            if (lastDate.getDay() == 5)
                newValidUntil += CoinTimeHrs(2 * 24);

            if (now - newValidUntil > CoinTimeHrs(1)) {
                // If we are still reading yesterdays data 1 hr into the new trading day,
                // assume the market must be closed and push the validUntil until tomorrow
                newValidUntil = CoinTimeHrs(24);
            }
        }

        // If this validFrom occurred in the past, ensure it always happens
        // at least 2 seconds in the future.  That should ensure that 
        // no transactions will be registered against the current
        // price before this new pricing takes effect
        let minValidFrom = Math.max(validFrom, GetNow() + (2 * CoinTimeHZ));
        let lastEntry = data[lastkey];
        let low = parseFloat(lastEntry["3. low"]) / 100;
        let high = parseFloat(lastEntry["2. high"]) / 100;
        let newRecord = new ExchangeRate(low, high, minValidFrom, newValidUntil);

        InsertRate('Coin', newRecord.ValidFrom, newRecord);
        SetMostRecentRate('Coin', newRecord);
        latest = newRecord;
    }
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
    var forexJs = await QueryExchange("TIME_SERIES_INTRADAY&symbol=SPY&interval=1min");
    var dataJs = forexJs["Time Series (1min)"];
    return dataJs;
}




//////////////////////////////////////////////////////////////////////////////////////////////////////

async function QueryForexRate(currencyCode)
{
    const ticker = Exchanges[currencyCode].Name;
    var forexJs = await QueryExchange("CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=" + ticker);
    return forexJs["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
}

async function EnsureLatestFXRate(currencyCode, now)
{
    let latest = await GetLatestExchangeRate(currencyCode);
    // Only update FX every 5 minutes (it doesn't change that fast.
    const lastTimestamp = latest ? latest.Timestamp : 0;
    if (now - lastTimestamp < (CoinUpdateInterval - RateOffsetFromMarket))
        return latest;

    // Update with the latest USD/CAD forex
    let rate = await QueryForexRate(currencyCode);
    let timestamp = now + RateOffsetFromMarket;
    latest = new FXRate(rate, timestamp);
    InsertRate(currencyCode, timestamp, latest);
    SetMostRecentRate(currencyCode, latest);
    return latest
}


module.exports = {
    UpdateRates: function () {
        let now = GetNow();

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
                    if (latestFX.Timestamp < (now - CoinUpdateInterval))
                    {
                        console.error("Invalid timestamp: " + CTToDate(latestFX.Timestamp));
                        resolve(false);
                        return;
                    }
                }
                if (latestCoin != null && latestCoin.ValidUntil > now)
                    resolve(CTToDate(latestCoin.ValidUntil));
                else
                    resolve(false);
            }
            catch (err) {
                console.error(err);
                reject("Update failed");
            }
        });
    },

    GetLatestRateFor: function(currencyCode) {
        //GetLatestCoinRate
    },

    GetRatesFor: function (timestamp, currencyCode) {
        return new Promise((resolve, reject) => {
            let query = datastore
                .createQuery(currencyCode)
                .filter('__key__', '>', datastore.key([currencyCode, timestamp]))
                .limit(1)

            datastore.runQuery(query, function (err, entities) {
                if (err == null) {
                    if (entities.length == 0)
                        reject("No value registered for: " + timestamp)
                    else {
                        // entities = An array of records.
                        // Access the Key object for an entity.
                        const rates = entities[0];
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