import BasePluginSpec from '../contracts/contracts/plugins/BasePlugin.sol/BasePlugin.json' assert {type: "json"};
import { Contract } from '@ethersproject/contracts';
import type { Provider } from '@ethersproject/providers';
import { BasePlugin } from '../types';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { ContractState } from './types';
import { last } from '@thecointech/utilities';

type BaseLogs = {
  date: DateTime,
  user: string,
  path: string,
  amnt: Decimal
}

export async function getPluginLogs(address: string, user: string, provider: Provider, fromBlock: number) : Promise<BaseLogs[]> {
  const contract = new Contract(address, BasePluginSpec.abi, provider) as BasePlugin;
  const filter = contract.filters.ValueChanged(user);
  (filter as any).startBlock = fromBlock;
  const logs = await provider.getLogs(filter);

  const parsed = logs.map(l => contract.interface.parseLog(l));
  const times = await Promise.all(
    logs.map(async (l) => {
      const block = await provider.getBlock(l.blockNumber);
      return DateTime.fromSeconds(block.timestamp);
    })
  )
  return parsed.map((log, index) => ({
    date: times[index],
    user: log.args[0],
    path: log.args[1],
    amnt: new Decimal(log.args[2].toString()),
  }))
}

export function updateState(state: ContractState, from: DateTime, to: DateTime, logs: BaseLogs[]) {
  logs
    .filter(l => l.date >= from && l.date < to)
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
      const currentValue = toModify[lastAccessor] ?? new Decimal(0);
      toModify[lastAccessor] = currentValue.add(l.amnt);
    });
}
