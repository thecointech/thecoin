import {RbcApi} from './index';

test("Can fetch transactions", async () => {
    jest.setTimeout(500000);
    const api = new RbcApi();
    const from = new Date(2020, 1, 1);
    const to = new Date(2020, 2, 1);
    const tx = await api.getTransactions(from, to);
    console.log("All done", tx);
});