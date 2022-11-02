import { getFirestore, init } from "@thecointech/firestore";
import { Duration } from "luxon"
import { RateKey } from "../internals/rates/types";
import { seed } from "./seed"

it('seeds the DB appropriately', async () => {

  await init({});
  const from = await seed();

  const db = getFirestore();
  const now = Date.now();
  const validityInterval = Duration.fromObject({days: 1});

  // Verify we have entry for all this history
  async function VerifyData(type: RateKey, numKeys: number) {
    let ts = from.toMillis();
    do {
      const entry = await db.collection(type).doc(ts.toString()).get();
      expect(entry.exists);
      ts = ts + validityInterval.as('milliseconds');

      const data = entry.data();
      expect(data).toBeDefined();
      expect(Object.keys(data!).filter(k => k !== '_converter').length).toBe(numKeys);
      expect(data!.validTill).toBeDefined();
      expect(data!.validFrom).toBeDefined();

      // Uncomment once fix merged into mocked DB
      // const data = entry.data() as any;
      // expect(data!.validTill.toMillis()).toEqual(ts);
    } while (ts < now);
  }

  await VerifyData("Coin", 4);
  await VerifyData("FxRates", 181);

  // This cannot be tested with the mocked DB.  Just step through it in debug mode.
  // How many entries do we get if run the script again.
  // const coinEntries = await db.collection("Coin").get();
  // const numEntries = coinEntries.docs.length;

  // // Run seed a second time (emulator has persistance)
  // await SeedWithRandomRates(from, validityInterval);
  // const coinEntries2 = await db.collection("Coin").get();
  // expect(coinEntries2.docs.length).toEqual(numEntries);
});
