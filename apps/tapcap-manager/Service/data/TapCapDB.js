// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const Datastore = require('@google-cloud/datastore');

const TC = "/tc/";
const latest = "latest"

// Instantiate a datastore client
const datastore = Datastore({
    projectId: "thecoincore-212314"
});

class TapCapTransaction {
    constructor(request)
}

//
//  Returns the latest stored rate, or null if none present
//
function GetLatestTransaction(userAddress) {
    return new Promise((resolve, reject) => {
        // if we have no cached value, read from DB
        datastore.get(userAddress +  TC + latest, function (err, entity) {
            if (err == null) {
                resolve(entity);
            }
            // no error, we just don't have a latest value
            else resolve(null);
        });
    });
}

function SetLatestTransaction(userAddress, transaction) {
    let recordKey = datastore.key([TC, userAddress, 'latest']);
    return datastore.upsert({
        key: recordKey,
        data: transaction
    }) 
}

function AddNewTransaction(userAddress, transaction) {
    // Transactions are immutable, and cannot be updated once set.
    var timestamp = new Date().getTime()
    let recordKey = datastore.key([TC, userAddress, timestamp]);
    return datastore.insert({
        key: recordKey,
        data: transaction
    })
    SetLatestTransaction(userAddress, transaction)
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
    const validFrom = TimeToCT(lastTime) + RateOffsetFromMarket;
    if (validFrom >= latestValidUntil) {

        // New entry, enter it into the database
        // Each entry is valid for 1 minute
        let newValidUntil = validFrom + CoinUpdateInterval;
        // If EOD, add enough time so the market is open again
        if (tzus(lastTime, "%-HH", "America/New_York") == "16H") {
            // Add 17.5 hours and 1 minute.  Should be 9:31:30
            let newLastTime = tz(lastTime, "+1 day", "-6 hours", "-29 minutes");
            // Validate this is the correct time
            if (tzus(newLastTime, "%R:%S", "America/New_York") != "09:31:00") {
                throw ("Got invalid market start time: " + tzus(newLastTime, "%F %R:%S", "America/New_York"));
            }
            // If it's a friday, skip the weekend
            if (tzus(lastTime, "%w", "America/New_York") == 5) 
                newLastTime = tz(newLastTime, "+2 days");
            // If we are still reading yesterdays data 1 hr into the new trading day,
            // assume the market must be closed and push the validUntil until tomorrow
            if (now - newValidUntil > CoinTimeHrs(1)) 
                newLastTime = tz(newLastTime, "+1 day");

            newValidUntil = TimeToCT(newLastTime) + RateOffsetFromMarket;
            console.log('Update Validity until: ' + tzus(newValidUntil * 100 + ZeroTime, "%F %R:%S", "America/New_York"));
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
    rate = Number.parseFloat(rate);
    let timestamp = now + RateOffsetFromMarket;
    latest = new FXRate(rate, timestamp);
    InsertRate(currencyCode, timestamp, latest);
    SetMostRecentRate(currencyCode, latest);
    return latest
}


module.exports = {
    GetLatestTransaction: GetLatestTransaction
}