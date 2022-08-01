import "@thecointech/setenv";
import { getAllUsers, getAllActions } from "@thecointech/broker-db";
import { init } from "@thecointech/firestore";
import { writeFileSync } from 'fs';
import { cacheFile } from './load';
import { EtherscanProvider, TransactionResponse } from '@ethersproject/providers';
import { GetContract } from '@thecointech/contract-core';
import { isPresent, NormalizeAddress } from '@thecointech/utilities';
import { toIgnore } from './changes';

export async function fetchDB() {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
  await init();
  const users = await getAllUsers();
  const actions = await getAllActions(users);
  writeFileSync(cacheFile, JSON.stringify(actions, undefined, 2))
}

const contract = await GetContract();
const provider = new EtherscanProvider("ropsten", process.env.ETHERSCAN_API_KEY);

async function buildTransaction(resp:  TransactionResponse) {
  // Ignore everything to do with this early account
  if (toIgnore(resp.from))
    return false;

  const reciept = await provider.getTransactionReceipt(resp.hash);
  return {
    hash: resp.hash,
    timestamp: resp.timestamp,
    transfers: reciept.logs.map(log => {
      if (!log.topics.includes('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'))
        return false

      const extra = contract.interface.parseLog(log);
      return {
        from: NormalizeAddress(extra.args.from),
        to: NormalizeAddress(extra.args.to),
        value: extra.args.value.toNumber(),
      }
    }).filter(tr => tr)
  }
}

export async function fetchHistory() {
  const allTxs = await provider.getHistory("0x6ff8a26a831c15b316671ffc8e2b2cfa7d918530");

  const r = [] as any[];
  for (let i = 0; i < allTxs.length; i++) {
    const t = await buildTransaction(allTxs[i]);
    if (t && t.transfers && t.transfers.length > 0 && t.transfers[0] !== false) {
      r.push(t);
    }
    if (i % 100 == 0)
      console.log(`Processed ${i} of ${allTxs.length}`);
  }
  return r.filter(isPresent)
}

async function fetchBalances(users: string[]) {
  const contract = GetContract();
  const r: Record<string, number> = {};
  for (const user of users) {
    r[user] = (await contract.balanceOf(user)).toNumber();
  }
  return r;
}

export const ropstenHistory = __dirname + '/blockchain.json';
async function fetchRopsten() {
  const history = await fetchHistory();

  const users = new Set<string>();
  history.forEach(h => h.transfers.forEach((t: any) => {
    if (t) {
      users.add(t.from);
      users.add(t.to);
    }
  }));
  const balances = await fetchBalances([...users]);
  writeFileSync(ropstenHistory, JSON.stringify({
    history,
    balances,
  }, null, 2));

}

fetchDB();
fetchRopsten();
