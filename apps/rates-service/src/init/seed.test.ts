import { GetFirestore, init } from "@the-coin/utilities/firestore";
import { DateTime, Duration } from "luxon"
import { RateKey } from "../internals/rates/types";
import { SeedWithRandomRates } from "./seed"

it('seeds the DB appropriately', async () => {

  await init({});
  const db = GetFirestore();

  const now = Date.now();
  const from = DateTime.local().minus({years: 1.1});
  const validityInterval = Duration.fromObject({days: 1});
  await SeedWithRandomRates(from, validityInterval);

  // Verify we have entry for all this history
  async function VerifyData(type: RateKey) {
    let ts = from.toMillis();
    do {
      const entry = await db.collection(type).doc(ts.toString()).get();
      expect(entry.exists);
      ts = ts + validityInterval.as('milliseconds');

      // Uncomment once fix merged into mocked DB
      //const data = entry.data() as any;
      //expect(data.validTill.toMillis()).toEqual(ts);
    } while (ts < now);
  }

  await VerifyData("Coin");
  await VerifyData("FxRates");

  // This cannot be tested with the mocked DB.  Just step through it in debug mode.
  // How many entries do we get if run the script again.
  // const coinEntries = await db.collection("Coin").get();
  // const numEntries = coinEntries.docs.length;

  // // Run seed a second time (emulator has persistance)
  // await SeedWithRandomRates(from, validityInterval);
  // const coinEntries2 = await db.collection("Coin").get();
  // expect(coinEntries2.docs.length).toEqual(numEntries);
});
