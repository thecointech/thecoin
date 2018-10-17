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
			let lastTime = 1539720000000
			let fixedUntil = Update.FixCoinValidUntil(lastTime + (30 * 1000), lastTime, lastTime + 2000);
			let newUntil = tzus(fixedUntil, "%F %R:%S", "America/New_York")
			assert(newUntil == "2018-10-17 09:31:30")
			done();
		});
	})
});