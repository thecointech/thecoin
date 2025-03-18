import { BlockTag, Filter, AbstractProvider, Transaction, type LogParams, type Log, zeroPadValue } from 'ethers';
import { ERC20Response } from '../erc20response';
import transferFrom from './logs-transfer-from.json' with { type: 'json' };
import transferTo from './logs-transfer-to.json' with { type: 'json' };
import exactFrom from './logs-exact-from.json' with { type: 'json' };
import exactTo from './logs-exact-to.json' with { type: 'json' };
import { getSourceCode } from '../plugins_devlive';

export class Erc20Provider extends AbstractProvider {
  connection: { url: string; };

  constructor() {
    super('any');

    this.connection = {
      url: "mocked",
    }
  }

  async getBalance(): Promise<bigint> {
    return 100_000_000_000_000_000_000n; // 100Eth
  }

  // Implement fns to allow sending mocked txs (not currently used)
  txs: Record<string, number> = {};
  override async getTransactionCount(address: string): Promise<number> {
    return this.txs[address] || 0;
  }
  override async broadcastTransaction(signedTx: string) {
    const tx = Transaction.from(signedTx)
    const address = tx.from!;
    this.txs[address] = (this.txs[address] || 0) + 1;
    return Promise.resolve<any>("0x" + "00".repeat(64));
  }
  override async getNetwork() {
    return Promise.resolve<any>({ chainId: 99999, name: "mocked" });
  }
  override async getFeeData(): Promise<any> {
    return {
      maxFeePerGas: 100n,
      maxPriorityFeePerGas: 100n,
      gasPrice: 100n,
    }
  }
  override async estimateGas(): Promise<bigint> {
    return 100_000n;
  }

  //
  // In devlive, we do not have access to Etherscans advanced api
  // but we can replicate using just events
  async getERC20History(args: {address?: string, contractAddress?: string, fromBlock?: BlockTag, toBlock?: BlockTag}) {

    const remapping: any = await getRemapping(args.address);
    const result = [...transferFrom.result, ...transferTo.result];
    return result.map((tx) : ERC20Response => {
      const blockNumber = parseInt(tx.blockNumber, 16);
      return {
        blockNumber: blockNumber,
        timestamp: blockNumber,
        hash: tx.transactionHash,
        blockHash: tx.blockHash,
        contractAddress: tx.address,
        transactionIndex: tx.transactionIndex,

        from: remapping[tx.topics[1]],
        to: remapping[tx.topics[2]!],
        value: BigInt(tx.data),
      } as any;
    }).sort((a, b) => a.blockNumber - b.blockNumber);

  }

  async getEtherscanLogs(filter: Filter, _conditional: "or"|"and") : Promise<Array<LogParams>>{

    // We get called from logs, and that'd throw if we returned this...
    if (filter.topics?.[0] != '0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75')
      return [];

    const raw = (filter.topics?.[1] === null)
      ? exactFrom
      : exactTo;

    const clientTopic = filter.topics!.slice(1).find(t => t) as string
    const remapping: any = await getRemapping(clientTopic);
    remapping.broker = zeroPadValue(remapping.broker, 32);

    return raw.result.map(l => ({
      ...l,
      blockNumber: parseInt(l.blockNumber, 16),
      index: parseInt(l.logIndex, 16),
      transactionIndex: parseInt(l.transactionIndex, 16),
      topics: l.topics.map(t => remapping[t] ?? t),
      removed: false,
    }))
  }

  override async resolveName(name: string) {
    return name;
  }

  override async getLogs(): Promise<Log[]> {
    return [];
  }

  async getSourceCode(name: string) {
    return getSourceCode({name});
  }
}

async function getRemapping(clientAddress?: string) : Promise<Record<string, string>> {
  // This remapping will not work in development node scripts
  // As this function currently only happens on the website that shouldn't be a problem
  if (!process.env.WALLET_BrokerCAD_ADDRESS) console.error("Expected BrokerCAD address is missing, remapping will not work");
  return {
    // random address if none supplied
    client: clientAddress ?? "0x383Bece786eB848e51A373B2dd96914B0ac1b04B",
    broker: process.env.WALLET_BrokerCAD_ADDRESS ?? "BROKER_ADDRESS_MISSING",
  }
}

export const getProvider = () => new Erc20Provider()
