import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { ContractState } from './types';
import { isDefined, last, NormalizeAddress } from '@thecointech/utilities';
import type { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';
import { BasePlugin__factory } from './codegen';
import type { AddressLike } from 'ethers';

type BaseLogs = {
  timestamp: DateTime,
  user: string,
  path: string,
  amnt: Decimal
}

export async function getPluginLogs(address: string, user: AddressLike, provider: Erc20Provider, fromBlock: number) : Promise<BaseLogs[]> {
  const contract = BasePlugin__factory.connect(address, provider);
  const filter = contract.filters.ValueChanged(user);
  const logs = await contract.queryFilter(filter, fromBlock);

  return logs
    .map(log => log?.args)
    .filter(isDefined)
    .map(args => ({
      user: NormalizeAddress(args.user),
      timestamp: DateTime.fromMillis(Number(args.msTime)),
      path: args.path,
      amnt: new Decimal(args.change.toString()),
  }))
}

export function updateState(state: ContractState, to: DateTime, logs: BaseLogs[]) {
  // remember to ensure we only apply changes since we last updated.
  // this is (premature?) optimization.
  //state.__$lastUpdate ??= DateTime.fromSeconds(0);
  logs
    .filter(l => l.timestamp < to)
    .forEach(l => {
      // Special-case item "user" derefences the address
      const getAccessor = (acc: string) => acc == "user" ? l.user : acc;
      // Manually parse the thingy
      const matched = l.path.match(/[^\[\]\.]*/gm)
      const pathItems = matched?.filter(m => !!m);
      if (!pathItems || pathItems.length == 0) throw new Error(`Cannot match on ${matched}`);
      // Follow the path through to the last containing object
      let toModify: any = state;
      for (const item of pathItems.slice(0, -1)) {
        const accessor = getAccessor(item);
        toModify[accessor] ??= {};
        toModify = toModify[accessor];
      }
      // Apply change to the last accessor in the path
      const lastAccessor = getAccessor(last(pathItems));
      toModify[lastAccessor] = l.amnt;
    });
  return state

  // }
  // state.__$lastUpdate = to;
  // return state;
}
