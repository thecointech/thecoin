import { replay } from "./mock_replay";
import currency from "currency.js";

// TODO: Update jest paths so this test runs...
it ('has sufficient chq balance', async () => {
    const chq = await replay({ name: 'chqBalance', events: [] });
    expect((chq.AccountsSummary.balance as currency).intValue).toBeGreaterThan(1000);
})
