import { accounts, contract } from '@openzeppelin/test-environment';
import { TheGreenNFTL2Contract } from '../migrations/types';

// Loads a compiled contract using OpenZeppelin test-environment
contract.artifactsDir = "src/contracts";
const factory: TheGreenNFTL2Contract = contract.fromArtifact('TheGreenNFTL2');
const minter = accounts[0];

it('Returns relevant validity', async () => {
  const nft = await factory.new(minter, minter);
  const ids = [1, 10, 100, 1000, 10000];
  await nft.bulkMinting(ids, 2000, {from: minter});
  const validities = await Promise.all(
    // the Validity fn returns a tuple.  Maybe because of this it
    // doesn't turn up in our contract types.  It is there though
    // so cast to 'any' and away we go
    ids.map(id => nft.validity(id))
  );
  const asNums =validities.map((vals) => [vals[0].toNumber(), vals[1].toString()]);
  const maxInt = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const expected = [maxInt, "2050", "2050", "2005", "2001"];
  asNums.forEach(([start, end], idx) => {
    expect(start).toBe(2000);
    expect(end).toEqual(expected[idx]);
  })
})
