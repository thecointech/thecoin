import BasePluginSpec from './contracts/contracts/BasePlugin.sol/BasePlugin.json' assert {type: "json"};
import { BasePlugin } from './types/contracts/BasePlugin';
import { Contract } from '@ethersproject/contracts';
import type { Provider } from '@ethersproject/providers';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { ContractState } from './types';
import { last } from '@thecointech/utilities';

type BaseLogs = {
  timestamp: DateTime,
  user: string,
  path: string,
  amnt: Decimal
}

export async function getPluginLogs(address: string, user: string, provider: Provider, fromBlock: number) : Promise<BaseLogs[]> {
  const contract = new Contract(address, BasePluginSpec.abi, provider) as BasePlugin;
  const filter = contract.filters.ValueChanged(user);
  const logs = await contract.queryFilter(filter, fromBlock);

  return logs.map(log => ({
    user: log.args.user,
    timestamp: DateTime.fromSeconds(log.args.timestamp.toNumber()),
    // user: log.args[0],
    path: log.args.path,
    amnt: new Decimal(log.args.change.toString()),
  }))
}

export function updateState(state: ContractState, to: DateTime, logs: BaseLogs[]) {
  // We track last time this
  state.__$lastUpdate ??= DateTime.fromSeconds(0);
  logs
    .filter(l => state.__$lastUpdate <= l.timestamp && l.timestamp < to)
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
  state.__$lastUpdate = to;
}
