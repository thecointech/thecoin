import * as firestore from '../exchange/Firestore';
import { ExchangeRate } from '../update/UpdateDb';

const Update = require('../Update/UpdateDb');
//const assert = require('assert');
const tz = require('timezone/loaded');
const tzus = tz(require("timezone/America"));

process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
firestore.init();

test('should return ms to wait to reach "seconds past the minute"', function () {
	let now = new Date(1539739800123);
	let toWait = Update.GetMsTillSecsPast(2, now);
	let fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;
	expect(fin).toEqual(2000); // "Did not wait"

	now = new Date(1539739835123);
	toWait = Update.GetMsTillSecsPast(30, now);
	fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;

	expect(toWait).toEqual(0); // "Waited when it should not have");
	//done();
});

test('should return a valid rate', async function() {
	let now = new Date();
	const latest = await Update.GetLatestCoinRate(now.getTime(), 0)
	expect(latest.ValidFrom).toBeLessThanOrEqual(now.getTime()); //, "Fetched rate is not yet valid")
	expect(latest.ValidUntil).toBeGreaterThanOrEqual(now.getTime()); //, "Fetched rate is already invalid")
});

test('should return latest rate', async function() {
	let now = new Date();
	var latestRate = new ExchangeRate(10, 10, now.getTime(), now.getTime());
	Update.InsertRate(0, now.getTime()-2000, latestRate);
	Update.SetMostRecentRate(0, latestRate);

	var latestRate2 = new ExchangeRate(12, 12, now.getTime(), now.getTime());
	Update.InsertRate(0, now.getTime()-1000, latestRate2);
	Update.SetMostRecentRate(0, latestRate2);
    
	const latest = await Update.GetRatesFor(0, now.getTime())
	expect(latest.ValidFrom).toBeLessThanOrEqual(<any>now); //, "Fetched rate is not yet valid")
	expect(latest.ValidUntil).toBeGreaterThanOrEqual(<any>now); //, "Fetched rate is already invalid")
});

test('should correctly generate a validity taking into account end-of-day', function() {

	// 2018-10-16 16:00:00 at time: Wed Oct 17 2018 07:51:14 GMT-0400
	// TODO: Fill this out (obviously)
	let lastTime = 1539720000000
	let fixedUntil = Update.FixCoinValidUntil(lastTime, lastTime + 2000);
	let newUntil = tzus(fixedUntil, "%F %R:%S", "America/New_York")
	expect(newUntil).toMatch("2018-10-17 09:31:30")

	lastTime = 1540323090000;
	fixedUntil = Update.FixCoinValidUntil(lastTime, lastTime);
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
		let hrs = Update.FXUpdateInterval / (60 * 60 * 1000)
		expect(bhr % hrs).toBe(0); //, "Did not land on hour boundary")
	}
	let AlignToNextBoundary = Update.AlignToNextBoundary
	let ts = tz("2000-01-01");
	let boundary = AlignToNextBoundary(ts, Update.FXUpdateInterval);
	validate(ts, boundary);

	ts = new Date().getTime()
	boundary = AlignToNextBoundary(ts, Update.FXUpdateInterval);
	validate(ts, boundary);

	ts = tzus("2018-07-20 00:10:13", "America/New_York")
	boundary = AlignToNextBoundary(ts, Update.FXUpdateInterval);
	validate(ts, boundary);

	ts = tzus("2018-07-20 23:45:27.132", "America/New_York")
	boundary = AlignToNextBoundary(ts, Update.FXUpdateInterval);
	validate(ts, boundary);
});