import { connectOracle, updateRates } from '@thecointech/contract-oracle';
import { getSigner } from '@thecointech/signers';
import { getCombinedRates } from './rates';

export async function updateOracle(timestamp: number) {
  const signer = await getSigner("OracleUpdater");
  const oracle = await connectOracle(signer);

  // Our oracle operates in seconds
  await updateRates(oracle, timestamp / 1000, async (ts) => {
    // do we have a data for this time?
    const rates = await getCombinedRates(ts * 1000);
    if (!rates) return null;
    // Calculate TC => CAD
    const rate = rates["124"] * (rates.buy + rates.sell) / 2;
    return {
      rate,
      from: rates.validFrom / 1000,
      to: rates.validTill / 1000,
    }
  })
}
