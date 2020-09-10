import { GetContract } from "@the-coin/contract"

test('Can get wallet correctly', async ()=> {
  const wallet = await GetContract()
  expect(wallet).toBeDefined();
})
