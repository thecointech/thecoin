
import { update } from "./UpdateDb";

it('should return a valid rate', async function() {

  let now = Date.now();
  var validTill = update();
  expect(validTill).toBeTruthy();
  //expect(validTill).toBeLessThanOrEqual(now.getTime()); //, "Fetched rate is not yet valid")
  expect(validTill).toBeGreaterThanOrEqual(now); //, "Fetched rate is already invalid")
});

// it('should return ms to wait to reach (seconds past the minute)', function () {
// 	let now = new Date(1539739800123);
// 	let toWait = GetMsTillSecsPast(2, now);
// 	let fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;
// 	expect(fin).toEqual(2000);

// 	now = new Date(1539739835123);
// 	toWait = GetMsTillSecsPast(30, now);
// 	fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;

// 	expect(toWait).toEqual(0); // "Waited when it should not have");
// });
