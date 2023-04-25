import { jest } from '@jest/globals';

jest.setTimeout(60000);

it('can fetch logs', async () => {

  // const contract = await GetContract();
  // const provider = new Erc20Provider();

  // const address = NormalizeAddress(prodVars.WALLET_BrokerCAD_ADDRESS);
  // const contractAddress = contract.address;

  // const allTxs = await provider.getERC20History({address, contractAddress});
  // const filter = contract.filters.ExactTransfer(null, address);
  // (filter as any).fromBlock = parseInt(prodVars.INITIAL_COIN_BLOCK);
  // const logs1 = await provider.getEtherscanLogs(filter, "and");
  // const filter2 = contract.filters.ExactTransfer(address, null);
  // (filter2 as any).fromBlock = parseInt(prodVars.INITIAL_COIN_BLOCK);
  // const logs2 = await provider.getEtherscanLogs(filter2, "and");
  // const logs = [...logs1, ...logs2];

  // expect(logs.length).toEqual(allTxs.length);
});
