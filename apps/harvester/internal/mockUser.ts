import type { UserData } from '../src/Harvester/types';
import { Wallet } from 'ethers';

export function mockUser() : UserData {
  return {
    wallet: Wallet.createRandom(),
    creditDetails: {
      payee: 'payee',
      accountNumber: "12345"
    },
    callback: {
      subTaskCallback: () => {},
      taskCallback: () => {},
      setSubTaskEvents: () => {},
    } as any
  }
}
