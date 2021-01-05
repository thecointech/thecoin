import { loadAndMergeHistory } from "./fetch";
import { GetContract } from '@the-coin/contract';

it('Can fetch all transactions', async () => {
  jest.setTimeout(30000);
  const contract = await GetContract();
  const history = await loadAndMergeHistory("0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f", 0, contract, []);

  // Not sure what we can test for here other than the code functions!
  expect(history).toBeTruthy();
})
