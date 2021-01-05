import { loadAndMergeHistory } from "./fetch";
import { GetContract } from '@the-coin/contract';

it('Can fetch all transactions', async () => {
  jest.setTimeout(30000);
  const contract = await GetContract();
  const history = await loadAndMergeHistory("", 0, contract, []);

  // Not sure what we can test for here other than the code functions!
  expect(history).toBeTruthy();
})
