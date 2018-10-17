const Update = require('../Update/UpdateDb');
const assert = require('assert');
const tz = require('timezone/loaded');
const tzus = tz(require("timezone/America"));

describe('UpdateDb', function () {
	describe('#GetMsTillSecsPast()', function () {
		it('should return ms to wait to reach "seconds past the minute"', function (done) {
			let now = new Date(1539739800123);
			let toWait = Update.GetMsTillSecsPast(2, now);
			let fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;
			assert(fin == 2000, "Did not wait");

			now = new Date(1539739835123);
			toWait = Update.GetMsTillSecsPast(30, now);
			fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;

			assert(toWait == 0, "Waited when it should not have");
			done();
		});
	});

	describe('#GetLatestCoinRate(now, latestValidUntil)', function() {
		it('should return a valid rate', function (done) {
			let now = new Date();
			Update.GetLatestCoinRate(now.getTime(), 0)
			.then(latest => {
				assert(latest.ValidFrom <= now, "Fetched rate is not yet valid")
				assert(latest.ValidUntil > now, "Fetched rate is already invalid")
				done()
			});
		});
	});

	describe('#FixCoinValidUntil(validUntil, lastTime, now)', function() {
		it('should correctly generate a validity taking into account end-of-day', function (done) {
			// 2018-10-16 16:00:00 at time: Wed Oct 17 2018 07:51:14 GMT-0400
			// TODO: Fill this out (obviously)
			let lastTime = 1539720000000
			let fixedUntil = Update.FixCoinValidUntil(lastTime, lastTime + 2000);
			let newUntil = tzus(fixedUntil, "%F %R:%S", "America/New_York")
			assert(newUntil == "2018-10-17 09:31:30")
			done();
		});
	})

	describe('#AlignToNextBoundary(timestamp, updateInterval)', function() {
		it('should correctly find boundaries for a variety of times', function (done) {
			let validate = function(ts, boundary) {
				let dbgts = tzus(ts, "%F %H %M:%S", "America/New_York");
				let dbgbd = tzus(boundary, "%F %H %M:%S", "America/New_York");
				assert(boundary > ts, "Did not find future boundary")
				assert(boundary % 1000 == 0, "Did not remove MS");
				assert(tzus(boundary, "%M:%S", "America/New_York") == "31:30", "Did not land on min/sec boundary")

				let bhr = tzus(boundary, "%H", "America/New_York")
				let hrs = Update.FXUpdateInterval / (60 * 60 * 1000)
				assert(bhr % hrs == 0, "Did not land on hour boundary")
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
			done();
		});
	});
});