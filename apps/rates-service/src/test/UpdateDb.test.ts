import * as firestore from '../firestore/Firestore';
import { ExchangeRate, FXUpdateInterval, getRateFromDb, insertRate, getCollectionRates, alignToNextBoundary, getLatestCoinRate, GetMsTillSecsPast, FixCoinValidUntil } from '../update/UpdateDb';

//const assert = require('assert');
const tz = require('timezone/loaded');
const tzus = tz(require("timezone/America"));

process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
firestore.init();

test('should return ms to wait to reach (seconds past the minute)', function () {
	let now = new Date(1539739800123);
	let toWait = GetMsTillSecsPast(2, now);
	let fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;
	expect(fin).toEqual(2000);

	now = new Date(1539739835123);
	toWait = GetMsTillSecsPast(30, now);
	fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;

	expect(toWait).toEqual(0); // "Waited when it should not have");
});

test('should return a valid rate', async function() {

	let now = new Date();

	const latest = await getLatestCoinRate(now.getTime(), 0);
	if (latest){
		expect(latest.validFrom).toBeLessThanOrEqual(now.getTime()); //, "Fetched rate is not yet valid")
		expect(latest.validUntil).toBeGreaterThanOrEqual(now.getTime()); //, "Fetched rate is already invalid")
	} else {
		throw new Error('No rate returned');
	}
});

test('can insert rates', async function() {
	jest.setTimeout(50000);
	let now = new Date();

	// ------- Create a new rate (expire in 1.5 min) -------
	var latestRate = new ExchangeRate(10, 10, now.getTime(), now.getTime()+125000);
	insertRate(0, latestRate);
	// ------- Check if the new rate is here -------
    (await getRateFromDb(0)).get().then(function(doc) {
        if (doc.exists) {
			let idToDelete = doc.id;
			expect(doc.get("buy")).toEqual(10);

			// ------- Delete the rate created -------
			getCollectionRates(0).doc(idToDelete).delete();
        }
    }).catch(function(error) {
        console.log("Error getting rate:", error);
    });
});

test('should return latest rate', async function() {
	let now = new Date().getTime();

	// ------- Check if the new rate is here -------
    (await getRateFromDb(0)).get().then(function(doc) {
        if (doc.exists) {
			let validFrom = doc.get("validFrom");
			let validUntil = doc.get("validUntil");
			expect(validFrom).toBeLessThanOrEqual(<any>now); //, "Fetched rate is not yet valid")
			expect(validUntil).toBeGreaterThanOrEqual(<any>now); //, "Fetched rate is already invalid")
        }
    }).catch(function(error) {
        console.log("Error getting rate:", error);
    });
});

test('should correctly generate a validity taking into account end-of-day', function() {

	// 2018-10-16 16:00:00 at time: Wed Oct 17 2018 07:51:14 GMT-0400
	// TODO: Fill this out (obviously)
	let lastTime = 1539720000000
	let fixedUntil = FixCoinValidUntil(lastTime, lastTime + 2000);
	let newUntil = tzus(fixedUntil, "%F %R:%S", "America/New_York")
	expect(newUntil).toMatch("2018-10-17 09:31:30")

	lastTime = 1540323090000;
	fixedUntil = FixCoinValidUntil(lastTime, lastTime);
	newUntil = tzus(fixedUntil, "%F %R:%S", "America/New_York")
	expect(newUntil).toMatch("2018-10-23 18:31:30")
})

test('should correctly find boundaries for a variety of times', function() {
	let validate = function(ts: number, boundary: number) {
		//let dbgts = tzus(ts, "%F %H %M:%S", "America/New_York");
		//let dbgbd = tzus(boundary, "%F %H %M:%S", "America/New_York");
		expect(boundary).toBeGreaterThan(ts); //, "Did not find future boundary")
		expect(boundary % 1000).toBe(0); //, "Did not remove MS");
		expect(tzus(boundary, "%M:%S", "America/New_York")).toMatch("31:30"); //, "Did not land on min/sec boundary")

		let bhr = tzus(boundary, "%H", "America/New_York")
		let hrs = FXUpdateInterval / (60 * 60 * 1000)
		expect(bhr % hrs).toBe(0); //, "Did not land on hour boundary")
	}
	let ts = tz("2000-01-01");
	let boundary = alignToNextBoundary(ts, FXUpdateInterval);
	validate(ts, boundary);

	ts = new Date().getTime()
	boundary = alignToNextBoundary(ts, FXUpdateInterval);
	validate(ts, boundary);

	ts = tzus("2018-07-20 00:10:13", "America/New_York")
	boundary = alignToNextBoundary(ts, FXUpdateInterval);
	validate(ts, boundary);

	ts = tzus("2018-07-20 23:45:27.132", "America/New_York")
	boundary = alignToNextBoundary(ts, FXUpdateInterval);
	validate(ts, boundary);
});
