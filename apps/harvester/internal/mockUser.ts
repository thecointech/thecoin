import type { UserData } from '../src/Harvester/types';
import { Wallet } from 'ethers';
import type { HarvesterReplayCallbacks } from '@/Harvester/replay/replayCallbacks';
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
    } as Partial<HarvesterReplayCallbacks> as HarvesterReplayCallbacks,
  }
}
