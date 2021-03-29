import { describe, IsManualRun } from '@thecointech/jestutils';
import { getAllUserData } from './data';

describe('Live data fetches', () => {
  it('fetches data appropriately' , async () => {
    jest.setTimeout(10 * 60 * 1000);
    const users = await getAllUserData([]);
    expect(users).toBeTruthy();
  })
}, IsManualRun);
